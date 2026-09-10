const { middlewarePool } = require('../config/db');
const {
  updateConsentDecision,
} = require('../services/application.service');
const { HttpError } = require('../utils/httpError');

function validGlobalId(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.length > 255) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'global_id must be a non-empty value up to 255 characters.');
  }
  return value.trim();
}

async function getPendingApplications(req, res, next) {
  try {
    const globalId = validGlobalId(req.params.global_id);
    const result = await middlewarePool.query(
      `SELECT a.uarn, a.global_id, a.trigger_event, a.overall_status, a.created_at,
              t.task_id, t.target_department, t.status AS task_status
       FROM applications AS a
       LEFT JOIN application_tasks AS t ON t.uarn = a.uarn
       WHERE a.global_id = $1 AND a.overall_status = 'PENDING_CONSENT'
       ORDER BY a.created_at DESC, t.task_id ASC`,
      [globalId],
    );

    const byUarn = new Map();  
    for (const row of result.rows) {
      if (!byUarn.has(row.uarn)) {
        byUarn.set(row.uarn, {
          uarn: row.uarn,
          global_id: row.global_id,
          trigger_event: row.trigger_event,
          overall_status: row.overall_status,
          created_at: row.created_at,
          tasks: [],
        });
      }
      if (row.task_id !== null) {
        byUarn.get(row.uarn).tasks.push({
          task_id: row.task_id,
          target_department: row.target_department,
          status: row.task_status,
        });
      }
    }

    const applications = [...byUarn.values()];
    return res.status(200).json({
      data: { global_id: globalId, count: applications.length, applications },
    });
  } catch (error) {
    return next(error);
  }
}
async function updateApplicationConsent(req, res, next) {
  try {
    const uarn = validGlobalId(req.params.uarn);

    if (typeof req.body?.decision !== 'string') {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'decision is required and must be APPROVED or REJECTED.',
      );
    }

    const result = await updateConsentDecision({
      middlewarePool,
      uarn,
      decision: req.body.decision,
    });

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  getPendingApplications,
  updateApplicationConsent,
};
