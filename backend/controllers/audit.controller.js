const { middlewarePool } = require('../config/db');
const { getAuditLogs } = require('../services/audit.service');

async function getAuditLogsHandler(req, res, next) {
  try {
    const filters = {
      uarn: req.query.uarn || '',
      globalId: req.query.globalId || '',
      department: req.query.department || '',
      event: req.query.event || '',
    };

    const logs = await getAuditLogs(middlewarePool, filters);

    return res.status(200).json({
      data: logs,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAuditLogsHandler };
