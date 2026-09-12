/**
 * MahaSetu Connector Resolver Service
 *
 * The central abstraction that decouples workflow execution from
 * connector implementation. Given a department, the resolver decides
 * which connector type to use:
 *
 *                     WORKFLOW TASK
 *                          |
 *                          v
 *                 ┌──────────────────┐
 *                 │ Connector Resolver│
 *                 └────────┬─────────┘
 *                          |
 *               ┌──────────┴──────────┐
 *               │                     │
 *               v                     v
 *        API Connector          RPA Connector
 *               │                     │
 *               v                     v
 *      Government API          RPA Microservice
 *                                     │
 *                                     v
 *                                Playwright
 *                                     │
 *                                     v
 *                             Legacy Portal
 *
 * Resolution logic:
 *   1. Check environment: CONNECTOR_<DEPT_TOKEN>_TYPE
 *   2. If "RPA" → resolve bot ID → executeRpaConnector
 *   3. Otherwise → executeApiConnector (default)
 *
 * This keeps the workflow layer clean: it never asks "is this department
 * RPA or API?" — it just says "execute connector for department X."
 */

const { ConnectorResult, executeApiConnector } = require('./apiConnector.service');
const { executeRpaConnector, resolveBotId } = require('./rpaConnector.service');

/**
 * Connector type registry.
 * Reads CONNECTOR_<DEPT_TOKEN>_TYPE from environment.
 * Returns 'API' (default) or 'RPA'.
 *
 * @param {string} department - Department name (e.g. "Revenue_Department")
 * @returns {'API'|'RPA'}
 */
function resolveConnectorType(department) {
  const token = department.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
  const envKey = `CONNECTOR_${token}_TYPE`;
  const configured = (process.env[envKey] || '').trim().toUpperCase();

  if (configured === 'RPA') {
    return 'RPA';
  }

  return 'API';
}

/**
 * Resolve the correct connector and execute it.
 *
 * This is the ONLY function the workflow layer should call.
 * It abstracts away whether the target uses API or RPA.
 *
 * @param {object} options
 * @param {string} options.department - Target department
 * @param {string} options.triggerEvent - Workflow trigger event
 * @param {string} options.uarn - Unique Application Reference Number
 * @param {object} [options.payload] - Authorized data (will be minimized for RPA)
 * @returns {Promise<ConnectorResult>}
 */
async function resolveAndExecute({ department, triggerEvent, uarn, payload = null }) {
  const connectorType = resolveConnectorType(department);

  if (connectorType === 'RPA') {
    const botId = resolveBotId(department);

    if (!botId) {
      console.warn(
        `[ConnectorResolver] Department "${department}" is configured for RPA ` +
        `but no bot ID found (RPA_BOT_ID_${department.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}). ` +
        `Falling back to API Connector.`
      );
      return executeApiConnector({ department, triggerEvent, uarn, payload });
    }

    console.log(
      `[ConnectorResolver] Dispatching to RPA Connector: ` +
      `dept=${department}, bot=${botId}, uarn=${uarn}`
    );

    return executeRpaConnector({ department, triggerEvent, uarn, botId, payload });
  }

  // Default: API Connector
  console.log(
    `[ConnectorResolver] Dispatching to API Connector: ` +
    `dept=${department}, uarn=${uarn}`
  );

  return executeApiConnector({ department, triggerEvent, uarn, payload });
}

/**
 * Get a summary of the connector configuration for all known departments.
 * Useful for admin dashboards and monitoring.
 *
 * @param {string[]} departments - List of department names
 * @returns {object[]} Configuration summary per department
 */
function getConnectorRegistry(departments = []) {
  return departments.map((dept) => {
    const type = resolveConnectorType(dept);
    const botId = type === 'RPA' ? resolveBotId(dept) : null;
    const rpaBaseUrl = type === 'RPA' ? (process.env.RPA_BASE_URL || 'https://rpa-bot-production.up.railway.app') : null;

    return {
      department: dept,
      connectorType: type,
      status: 'ACTIVE',
      ...(type === 'RPA' ? { botId, rpaEndpoint: rpaBaseUrl } : {}),
    };
  });
}

module.exports = {
  ConnectorResult,
  executeApiConnector,
  resolveConnectorType,
  resolveAndExecute,
  getConnectorRegistry,
};
