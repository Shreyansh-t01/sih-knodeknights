const { isDeepStrictEqual } = require('util');

const { middlewarePool } = require('../config/db');
const { cdcChannel, legacyIdField, fieldEventMap, normaliseFieldName } = require('../config/cdc');
const { rulebookService } = require('./rulebook.service');
const { createApplicationWithTasks } = require('./application.service');

class CdcPayloadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CdcPayloadError';
  }
}

class UnmappedIdentityError extends Error {
  constructor(departmentName, legacyId) {
    super(`No main_global_db entry found for legacy ID "${legacyId}" in department "${departmentName}".`);
    this.name = 'UnmappedIdentityError';
  }
}

function isDataObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asDataObject(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new CdcPayloadError(`${fieldName} is required.`);
    return undefined;
  }
  if (!isDataObject(value)) {
    throw new CdcPayloadError(`${fieldName} must be a JSON object.`);
  }
  return value;
}

function parseNotificationPayload(rawPayload, departmentName) {
  if (typeof rawPayload !== 'string' || rawPayload.length === 0) {
    throw new CdcPayloadError('CDC notification has an empty payload.');
  }
  try {
    const payload = JSON.parse(rawPayload);
    if (!isDataObject(payload)) throw new CdcPayloadError('CDC payload must be a JSON object.');
    // Department identity comes from trusted listener configuration, not an
    // untrusted value that may have been included in the notification body.
    return departmentName ? { ...payload, department_name: departmentName } : payload;
  } catch (error) {
    if (error instanceof CdcPayloadError) throw error;
    throw new CdcPayloadError(`CDC payload is not valid JSON: ${error.message}`);
  }
}

function changedFields(oldData, newData) {
  const fields = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  return [...fields].filter((field) => !isDeepStrictEqual(oldData && oldData[field], newData && newData[field]));
}

function declaredChangedFields(payload) {
  if (!Array.isArray(payload.changed_fields)) return undefined;
  const fields = payload.changed_fields
    .filter((field) => typeof field === 'string' && field.trim())
    .map((field) => field.trim());
  if (fields.length === 0) {
    throw new CdcPayloadError('changed_fields must contain at least one field name when supplied.');
  }
  return [...new Set(fields)];   // returns a set of changes fields 
}

function deriveTriggerEvents(payload, oldData, newData) {
  const operation = String(payload.operation || payload.op || 'UPDATE').toUpperCase();
  if (!['INSERT', 'UPDATE'].includes(operation)) {
    return [];
  }

  const explicitlyChanged = declaredChangedFields(payload);  // it will contain set of changed fields 
  let fields;
  if (oldData) {
    fields = changedFields(oldData, newData);
  } else if (explicitlyChanged) {
    fields = explicitlyChanged;
  } else if (operation === 'INSERT') {
    // On insert, every supplied recognised field is new and therefore relevant.
    fields = Object.keys(newData);
  } else if (typeof payload.trigger_event === 'string' && payload.trigger_event.trim()) {
    return [payload.trigger_event.trim()];
  } else {
    throw new CdcPayloadError(
      'UPDATE payloads require old_data for data diffing, or changed_fields/trigger_event as an explicit fallback.',
    );
  }

  return [...new Set(fields
    .map((field) => fieldEventMap[normaliseFieldName(field)])
    .filter(Boolean))];
}

function extractLegacyId(payload, oldData, newData, sourceLegacyIdField) {
  const candidate = newData[sourceLegacyIdField]
    ?? (oldData && oldData[sourceLegacyIdField])
    ?? payload.legacy_id;
  if (candidate === undefined || candidate === null || String(candidate).trim() === '') {
    throw new CdcPayloadError(`No legacy ID found. Configure the source ID field (currently "${sourceLegacyIdField}").`);
  }
  return String(candidate).trim();
}

async function resolveGlobalId(pool, departmentName, legacyId) {
  const result = await pool.query(
    `SELECT global_id
     FROM main_global_db
     WHERE department_name = $1 AND legacy_id = $2
     LIMIT 1`,
    [departmentName, legacyId],
  );
  if (result.rowCount === 0) throw new UnmappedIdentityError(departmentName, legacyId);
  return String(result.rows[0].global_id);
}

class CdcListener {
  constructor({
    sourcePool,
    hubPool = middlewarePool,
    rulebook = rulebookService,
    departmentName = 'dept_1',
    channel = cdcChannel,
    sourceLegacyIdField = legacyIdField,
  } = {}) {
    if (!sourcePool) throw new TypeError('sourcePool is required for a CDC listener.');
    this.sourcePool = sourcePool;
    this.hubPool = hubPool;
    this.rulebook = rulebook;
    this.departmentName = departmentName;
    this.channel = channel;
    this.sourceLegacyIdField = sourceLegacyIdField;
    this.client = undefined;
    this.stopped = true;
    this.reconnectTimer = undefined;
    this.reconnectAttempt = 0;
    this.processingQueue = Promise.resolve();
  }

  async start() {
    if (!this.stopped) return;
    this.stopped = false;
    await this.connect();
  }

  async connect() {
    if (this.stopped || this.client) return;
    let client;
    try {
      client = await this.sourcePool.connect();
      this.client = client;
      client.on('notification', this.onNotification.bind(this));
      client.once('error', (error) => this.handleDisconnect(client, error));
      client.once('end', () => this.handleDisconnect(client, new Error('Legacy LISTEN connection ended.')));
      await client.query(`LISTEN ${this.channel}`);
      this.reconnectAttempt = 0;
      console.info(`CDC listener active for ${this.departmentName} on PostgreSQL channel "${this.channel}".`);
    } catch (error) {
      // A failure after checkout (for example LISTEN permission denied) must
      // release the client; otherwise each retry would exhaust legacyPool.
      if (this.client === client) {
        this.client = undefined;
        client.release(error);
      }
      console.error('Unable to establish CDC listener:', error.message);
      this.scheduleReconnect();
    }
  }

  onNotification(message) {
    // Process in notification order and ensure one bad payload cannot create an
    // unhandled promise rejection or stop future CDC work.
    this.processingQueue = this.processingQueue
      .then(() => this.processNotification(message))
      .catch((error) => this.logProcessingError(error));
  }

  async processNotification(message) {
    const payload = parseNotificationPayload(message.payload, this.departmentName);
    console.log(payload)
    const newData = asDataObject(payload.new_data ?? payload.data, 'new_data', { required: true });
    const oldData = asDataObject(payload.old_data, 'old_data');
    const triggerEvents = deriveTriggerEvents(payload, oldData, newData);
    console.log(triggerEvents)
    if (triggerEvents.length === 0) {
      console.info('CDC event had no recognised changed fields; no application was created.');
      return [];
    }

    const legacyId = extractLegacyId(payload, oldData, newData, this.sourceLegacyIdField);
    const globalId = await resolveGlobalId(this.hubPool, payload.department_name, legacyId);
    const createdApplications = [];

    for (const triggerEvent of triggerEvents) {
      const targets = this.rulebook.getTargets(triggerEvent);
      if (targets.length === 0) {
        console.warn(`No target departments configured for trigger event "${triggerEvent}".`);
        continue;
      }
      const result = await createApplicationWithTasks({
        middlewarePool: this.hubPool,
        globalId,
        triggerEvent,
        targets,
      });
      createdApplications.push(result);
      console.info(`Created ${result.application.uarn} for ${triggerEvent} with ${result.tasks.length} task(s).`);
    }

    return createdApplications;
  }

  handleDisconnect(client, error) {
    if (this.client !== client) return;
    this.client = undefined;
    client.release(error);
    if (!this.stopped) {
      console.error('CDC listener disconnected:', error.message);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.stopped || this.reconnectTimer) return;
    const delay = Math.min(1_000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.connect();
    }, delay);
    console.info(`CDC listener retry scheduled in ${delay}ms.`);
  }

  async stop() {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    const client = this.client;
    this.client = undefined;
    if (client) {
      try {
        await client.query(`UNLISTEN ${this.channel}`);
      } catch (error) {
        console.warn('Unable to UNLISTEN during shutdown:', error.message);
      } finally {
        client.release();
      }
    }
  }

  logProcessingError(error) {
    if (error instanceof UnmappedIdentityError || error instanceof CdcPayloadError) {
      console.warn(`CDC event ignored: ${error.message}`);
      return;
    }
    console.error('CDC event processing failed:', error.message);
  }
}

module.exports = {
  CdcListener,
  CdcPayloadError,
  UnmappedIdentityError,
  changedFields,
  deriveTriggerEvents,
  parseNotificationPayload,
  resolveGlobalId,
};
