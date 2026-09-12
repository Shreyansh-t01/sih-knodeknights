/**
 * MahaSetu API Connector Service
 *
 * Handles outbound communication with government departments that expose
 * a standards-compliant REST API. This is the preferred connector type.
 *
 * For the SIH prototype, the execution is simulated (no real department
 * API exists). In production, this would:
 * 1. Look up the department's API endpoint configuration
 * 2. Build the outbound payload from the canonical data model
 * 3. Call the department's real API endpoint with proper auth
 * 4. Parse and validate the response
 * 5. Return structured ConnectorResult
 */

class ConnectorResult {
  constructor({ success, department, message, connectorType = 'API', durationMs = 0, extractedData = null }) {
    this.success = success;
    this.department = department;
    this.message = message;
    this.connectorType = connectorType;
    this.durationMs = durationMs;
    this.extractedData = extractedData;
    this.executedAt = new Date().toISOString();
  }
}

/**
 * Execute an API connector call for a department task.
 *
 * @param {object} options
 * @param {string} options.department - Target department identifier
 * @param {string} options.triggerEvent - The event that triggered this task
 * @param {string} options.uarn - Unique Application Reference Number
 * @param {object} [options.payload] - Authorized data payload (data-minimized)
 * @returns {Promise<ConnectorResult>}
 */
async function executeApiConnector({ department, triggerEvent, uarn, payload = null }) {
  const startTime = Date.now();

  // Simulate network latency (100-400ms) for the prototype
  const latencyMs = 100 + Math.floor(Math.random() * 300);
  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  const durationMs = Date.now() - startTime;

  return new ConnectorResult({
    success: true,
    department,
    message: `API Connector: simulated successful ${triggerEvent} synchronization for ${department} (UARN: ${uarn}). No real department API was called.`,
    connectorType: 'API',
    durationMs,
  });
}

module.exports = {
  ConnectorResult,
  executeApiConnector,
};
