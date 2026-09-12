/**
 * MahaSetu RPA Connector Service
 *
 * Handles outbound communication with legacy government portals that
 * do NOT expose a usable API. Uses the deployed RPA Microservice
 * (Playwright-based) to automate browser interactions.
 *
 * Architecture:
 *   MahaSetu  --HTTPS-->  RPA Microservice  --Playwright-->  Legacy Portal
 *
 * CRITICAL DESIGN CONSTRAINTS:
 * 1. DATA MINIMIZATION: Only send the specific fields the bot needs.
 *    Never send the full citizen profile.
 * 2. CREDENTIALS STAY OUT: Portal login credentials are stored in the
 *    RPA service's bot configuration, never in MahaSetu.
 * 3. MahaSetu does NOT know how Playwright works. It simply says:
 *    "Execute bot X with variables Y" and receives a structured result.
 */

const { ConnectorResult } = require('./apiConnector.service');

// RPA Microservice configuration from environment
const RPA_BASE_URL = () => process.env.RPA_BASE_URL || 'https://rpa-bot-production.up.railway.app';
const RPA_API_KEY = () => process.env.RPA_API_KEY || '';
const RPA_TIMEOUT_MS = 60_000; // 60s — Playwright bots can take time

/**
 * Map a trigger event to the minimal set of variable fields the RPA bot needs.
 * This enforces data minimization: only authorized, specific fields are sent.
 *
 * @param {string} triggerEvent - The workflow trigger event type
 * @param {object} payload - Full authorized data payload
 * @returns {object} Minimized variables for the RPA bot
 */
function buildMinimizedVariables(triggerEvent, payload) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const fieldMappings = {
    Address_Update: ['address_line1', 'city', 'district', 'state', 'pincode'],
    Name_Update: ['first_name', 'last_name'],
    Income_Update: ['annual_income', 'income_certificate_number'],
    Caste_Update: ['caste_category', 'caste_certificate_number'],
    Education_Update: ['institution_name', 'degree', 'year_of_passing'],
    Domicile_Update: ['state', 'district', 'domicile_certificate_number'],
    Scholarship_Application: ['scheme_name', 'application_id'],
  };

  const allowedFields = fieldMappings[triggerEvent];
  if (!allowedFields) {
    // Unknown event type — send no citizen data, only metadata
    return {};
  }

  const minimized = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      minimized[field] = payload[field];
    }
  }

  return minimized;
}

/**
 * Resolve the RPA bot ID for a given department.
 * Reads from environment: RPA_BOT_ID_<DEPARTMENT_TOKEN>
 *
 * @param {string} department - Department name (e.g. "Revenue_Department")
 * @returns {string|null} Bot ID or null if not configured
 */
function resolveBotId(department) {
  const token = department.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
  const envKey = `RPA_BOT_ID_${token}`;
  return process.env[envKey] || null;
}

/**
 * Execute an RPA connector call for a department task.
 *
 * Calls: POST <RPA_BASE_URL>/api/bots/<botId>/execute
 *
 * @param {object} options
 * @param {string} options.department - Target department identifier
 * @param {string} options.triggerEvent - The event that triggered this task
 * @param {string} options.uarn - Unique Application Reference Number
 * @param {string} options.botId - RPA bot ID (resolved by connector resolver)
 * @param {object} [options.payload] - Authorized data payload (will be minimized)
 * @returns {Promise<ConnectorResult>}
 */
async function executeRpaConnector({ department, triggerEvent, uarn, botId, payload = null }) {
  const startTime = Date.now();
  const baseUrl = RPA_BASE_URL();
  const apiKey = RPA_API_KEY();

  if (!botId) {
    return new ConnectorResult({
      success: false,
      department,
      message: `RPA Connector: No bot ID configured for department ${department}.`,
      connectorType: 'RPA',
      durationMs: Date.now() - startTime,
    });
  }

  // Data minimization: only send what the bot needs
  const variables = buildMinimizedVariables(triggerEvent, payload);

  const url = `${baseUrl}/api/bots/${encodeURIComponent(botId)}/execute`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RPA_TIMEOUT_MS);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Only send API key if configured (the RPA service may not require it)
    if (apiKey) {
      headers['x-rpa-api-key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return new ConnectorResult({
        success: false,
        department,
        message: `RPA Connector: Bot ${botId} returned HTTP ${response.status} — ${errorText}`,
        connectorType: 'RPA',
        durationMs,
      });
    }

    const result = await response.json();

    // Map the RPA service response to ConnectorResult
    const rpaSuccess = result.outcome === 'success' || result.status === 'COMPLETED';
    const extractedData = result.extracted_data || result.result || null;

    return new ConnectorResult({
      success: rpaSuccess,
      department,
      message: rpaSuccess
        ? `RPA Connector: Bot "${botId}" completed ${triggerEvent} for ${department} (UARN: ${uarn}) via Playwright automation.`
        : `RPA Connector: Bot "${botId}" failed — ${result.message || 'Unknown RPA error'}`,
      connectorType: 'RPA',
      durationMs: result.duration ? Math.round(result.duration * 1000) : durationMs,
      extractedData,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return new ConnectorResult({
        success: false,
        department,
        message: `RPA Connector: Bot ${botId} timed out after ${RPA_TIMEOUT_MS}ms.`,
        connectorType: 'RPA',
        durationMs,
      });
    }

    return new ConnectorResult({
      success: false,
      department,
      message: `RPA Connector: Connection error — ${error.message}`,
      connectorType: 'RPA',
      durationMs,
    });
  }
}

module.exports = {
  executeRpaConnector,
  resolveBotId,
  buildMinimizedVariables,
};
