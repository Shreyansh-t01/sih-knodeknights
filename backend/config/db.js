const { Pool } = require('pg');
const { envFilePath, envLoadResult } = require('./env');
const { getLegacySourceConfigs } = require('./cdc');

function optionalBoolean(name) {
  const value = process.env[name];
  if (value === undefined || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be either "true" or "false".`);
}

function positiveInteger(name, fallback) {
  const rawValue = process.env[name] || String(fallback);
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function createPool(connectionString, label) {
  const useSsl = optionalBoolean('DB_SSL');
  const rejectUnauthorized = optionalBoolean('DB_SSL_REJECT_UNAUTHORIZED');
  const config = {
    connectionString,
    max: positiveInteger('DB_POOL_MAX', 10),
    idleTimeoutMillis: positiveInteger('DB_IDLE_TIMEOUT_MS', 30_000),
    connectionTimeoutMillis: positiveInteger('DB_CONNECTION_TIMEOUT_MS', 10_000),
    application_name: `middleware-${label}`,
  };

  // When DB_SSL is omitted, pg honours SSL options embedded in DATABASE_URL
  // (for example, ?sslmode=require). Set DB_SSL explicitly for local setups.
  if (useSsl !== undefined) {
    config.ssl = useSsl
      ? { rejectUnauthorized: rejectUnauthorized === undefined ? true : rejectUnauthorized }
      : false;
  }

  const pool = new Pool(config);
  pool.on('error', (error) => {
    // An idle client error must be handled or Node treats it as an uncaught error.
    console.error(`${label} pool idle-client error:`, error.message);
  });
  return pool;
}

function assertDatabaseConfiguration() {
  const missing = [
    ...(process.env.MIDDLEWARE_DATABASE_URL ? [] : ['MIDDLEWARE_DATABASE_URL']),
    ...legacySources
      .filter((source) => !source.connectionString)
      .map((source) => source.databaseUrlEnvironment),
  ];

  if (missing.length > 0) {
    if (envLoadResult.error && envLoadResult.error.code !== 'ENOENT') {
      throw new Error(`Unable to load environment file at ${envFilePath}: ${envLoadResult.error.message}`);
    }
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}.`);
  }
}

const legacySources = getLegacySourceConfigs().map((source) => ({
  ...source,
  pool: createPool(source.connectionString, `legacy-${source.departmentName}`),
}));
const legacyPool = legacySources[0].pool;
const middlewarePool = createPool(process.env.MIDDLEWARE_DATABASE_URL, 'hub');

module.exports = { legacyPool, legacySources, middlewarePool, assertDatabaseConfiguration };
