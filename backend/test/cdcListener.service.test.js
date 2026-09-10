const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CdcPayloadError,
  changedFields,
  deriveTriggerEvents,
  parseNotificationPayload,
  resolveGlobalId,
} = require('../services/cdcListener.service');
const { generateUarn } = require('../services/application.service');

test('changedFields detects only values that actually differ, including nested data', () => {
  const before = {
    legacy_id: 'LEG-101',
    address: { line_1: 'Old road', pin: '110001' },
    email: 'citizen@example.gov',
  };
  const after = {
    legacy_id: 'LEG-101',
    address: { line_1: 'New road', pin: '110001' },
    email: 'citizen@example.gov',
  };

  assert.deepEqual(changedFields(before, after), ['address']);
});

test('deriveTriggerEvents maps changed legacy fields to one deduplicated event', () => {
  const events = deriveTriggerEvents(
    { operation: 'UPDATE' },
    { legacy_id: 'LEG-101', address: 'Old', mobile: '9999999999' },
    { legacy_id: 'LEG-101', address: 'New', mobile: '8888888888' },
  );

  assert.deepEqual(events, ['Address_Update', 'Mobile_Number_Update']);
});

test('deriveTriggerEvents refuses unsafe update diffing when old_data is absent', () => {
  assert.throws(
    () => deriveTriggerEvents({ operation: 'UPDATE' }, undefined, { legacy_id: 'LEG-101', address: 'New' }),
    CdcPayloadError,
  );
});

test('insert events consider supplied recognised fields as new', () => {
  const events = deriveTriggerEvents(
    { operation: 'INSERT' },
    undefined,
    { legacy_id: 'LEG-101', date_of_birth: '2000-01-01', ignored_column: 'x' },
  );

  assert.deepEqual(events, ['Date_of_Birth_Update']);
});

test('notification parsing rejects malformed JSON without leaking an exception type', () => {
  assert.throws(() => parseNotificationPayload('{not-json'), CdcPayloadError);
});

test('notification parsing attaches the trusted listener department to a payload', () => {
  const payload = parseNotificationPayload(
    '{"operation":"INSERT","department_name":"untrusted_value","new_data":{"id":101}}',
    'dept_1',
  );

  assert.equal(payload.department_name, 'dept_1');
});

test('identity resolution scopes a legacy ID to its department', async () => {
  const queries = [];
  const pool = {
    async query(sql, parameters) {
      queries.push({ sql, parameters });
      return { rowCount: 1, rows: [{ global_id: 'GLOBAL-101' }] };
    },
  };

  const globalId = await resolveGlobalId(pool, 'dept_1', '101');
  assert.equal(globalId, 'GLOBAL-101');
  assert.deepEqual(queries[0].parameters, ['dept_1', '101']);
  assert.match(queries[0].sql, /department_name = \$1 AND legacy_id = \$2/);
});

test('generateUarn produces a UUID-backed tracking number', () => {
  assert.match(generateUarn(), /^UARN-\d{17}-[A-F0-9]{16}$/);
});
