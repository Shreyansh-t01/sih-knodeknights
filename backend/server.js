const express = require('express');

const { assertDatabaseConfiguration, legacySources, middlewarePool } = require('./config/db');
const { CdcListener } = require('./services/cdcListener.service');
const mdmRoutes = require('./routes/mdm.routes');
const applicationRoutes = require('./routes/application.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const cdcListeners = legacySources.map((source) => new CdcListener({
  sourcePool: source.pool,
  departmentName: source.departmentName,
  channel: source.channel,
  sourceLegacyIdField: source.legacyIdField,
}));

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Middleware platform server is running' });
});

app.use('/api/mdm', mdmRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  assertDatabaseConfiguration();

  const port = Number(process.env.PORT || '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const server = app.listen(port, () => {
    console.info(`Middleware API listening on port ${port}`);
  });

  // CDC availability must not take down the read/API surface. The listener retries
  // its own legacy connection with backoff when the source database is unavailable.
  await Promise.all(cdcListeners.map((listener) => listener.start()));

  const shutdown = async (signal) => {
    console.info(`${signal} received; shutting down gracefully.`);
    server.close(async () => {
      await Promise.all(cdcListeners.map((listener) => listener.stop()));
      await Promise.allSettled([
        ...legacySources.map((source) => source.pool.end()),
        middlewarePool.end(),
      ]);
      process.exit(0);
    });
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start middleware API:', error.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
