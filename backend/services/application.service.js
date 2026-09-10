const { randomUUID } = require('crypto');
const { HttpError } = require('../utils/httpError');

function generateUarn() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  return `UARN-${timestamp}-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }
}

async function createApplicationWithTasks({
  middlewarePool,
  globalId,
  triggerEvent,
  targets,
}) {
  assertNonEmptyString(globalId, 'globalId');
  assertNonEmptyString(triggerEvent, 'triggerEvent');

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new TypeError('targets must be a non-empty array.');
  }

  const uniqueTargets = [
    ...new Set(
      targets
        .map((target) => String(target).trim())
        .filter(Boolean),
    ),
  ];

  if (uniqueTargets.length === 0) {
    throw new TypeError('targets must contain at least one department name.');
  }

  const uarn = generateUarn();
  const client = await middlewarePool.connect();

  try {
    await client.query('BEGIN');

    const applicationResult = await client.query(
      `INSERT INTO applications
       (uarn, global_id, trigger_event, overall_status, created_at)
       VALUES ($1, $2, $3, 'PENDING_CONSENT', NOW())
       RETURNING uarn, global_id, trigger_event, overall_status, created_at`,
      [uarn, globalId, triggerEvent],
    );

    const tasks = [];

    for (const targetDepartment of uniqueTargets) {
      const taskResult = await client.query(
        `INSERT INTO application_tasks
         (uarn, target_department, status)
         VALUES ($1, $2, 'WAITING')
         RETURNING task_id, uarn, target_department, status`,
        [uarn, targetDepartment],
      );

      tasks.push(taskResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      application: applicationResult.rows[0],
      tasks,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Application transaction rollback failed:',
        rollbackError.message,
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

async function updateConsentDecision({
  middlewarePool,
  uarn,
  decision,
}) {
  assertNonEmptyString(uarn, 'uarn');
  assertNonEmptyString(decision, 'decision');

  const normalizedDecision = decision.trim().toUpperCase();

  if (!['APPROVED', 'REJECTED'].includes(normalizedDecision)) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'decision must be APPROVED or REJECTED.',
    );
  }

  const client = await middlewarePool.connect();

  try {
    await client.query('BEGIN');

    const applicationResult = await client.query(
      `SELECT uarn, global_id, trigger_event, overall_status, created_at
       FROM applications
       WHERE uarn = $1
       FOR UPDATE`,
      [uarn.trim()],
    );

    if (applicationResult.rowCount === 0) {
      throw new HttpError(
        404,
        'APPLICATION_NOT_FOUND',
        `Application "${uarn}" was not found.`,
      );
    }

    const application = applicationResult.rows[0];

    if (application.overall_status !== 'PENDING_CONSENT') {
      throw new HttpError(
        409,
        'INVALID_CONSENT_STATE',
        `Application "${uarn}" is already ${application.overall_status}.`,
      );
    }

    const newApplicationStatus = normalizedDecision === 'APPROVED'
      ? 'APPROVED'
      : 'REJECTED';

    const newTaskStatus = normalizedDecision === 'APPROVED'
      ? 'READY'
      : 'CANCELLED';

    const updatedApplicationResult = await client.query(
      `UPDATE applications
       SET overall_status = $1
       WHERE uarn = $2
       RETURNING uarn, global_id, trigger_event, overall_status, created_at`,
      [newApplicationStatus, uarn.trim()],
    );

    const updatedTasksResult = await client.query(
      `UPDATE application_tasks
       SET status = $1,
           updated_at = NOW()
       WHERE uarn = $2
       RETURNING task_id, uarn, target_department, status, updated_at`,
      [newTaskStatus, uarn.trim()],
    );

    await client.query('COMMIT');

    return {
      application: updatedApplicationResult.rows[0],
      tasks: updatedTasksResult.rows,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Consent decision rollback failed:',
        rollbackError.message,
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  generateUarn,
  createApplicationWithTasks,
  updateConsentDecision,
};