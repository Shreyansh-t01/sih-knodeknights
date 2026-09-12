const { randomUUID } = require('crypto');
const { HttpError } = require('../utils/httpError');
const { recordAuditEvent } = require('./audit.service');

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

    await recordAuditEvent(client, {
      uarn: uarn.trim(),
      globalId: application.global_id,
      event: application.trigger_event,
      action: normalizedDecision === 'APPROVED' ? 'CONSENT_APPROVED' : 'CONSENT_REJECTED',
      actor: 'Citizen',
    });

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

// Valid status transitions for task execution workflow
const VALID_TASK_TRANSITIONS = {
  READY: ['PROCESSING', 'COMPLETED', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED', 'READY'],
  FAILED: ['READY', 'PROCESSING', 'COMPLETED'],
};

async function updateTaskStatus({
  middlewarePool,
  taskId,
  newStatus,
  actor = 'Department Officer',
}) {
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'taskId must be a positive integer.',
    );
  }

  assertNonEmptyString(newStatus, 'newStatus');
  const normalisedStatus = newStatus.trim().toUpperCase();

  const client = await middlewarePool.connect();

  try {
    await client.query('BEGIN');

    const taskResult = await client.query(
      `SELECT t.task_id, t.uarn, t.target_department, t.status,
              a.overall_status, a.trigger_event, a.global_id
       FROM application_tasks AS t
       INNER JOIN applications AS a ON a.uarn = t.uarn
       WHERE t.task_id = $1
       FOR UPDATE OF t`,
      [taskId],
    );

    if (taskResult.rowCount === 0) {
      throw new HttpError(
        404,
        'TASK_NOT_FOUND',
        `Task ${taskId} was not found.`,
      );
    }

    const task = taskResult.rows[0];
    const currentStatus = task.status;

    const allowedNext = VALID_TASK_TRANSITIONS[currentStatus];
    if (!allowedNext || !allowedNext.includes(normalisedStatus)) {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition task ${taskId} from ${currentStatus} to ${normalisedStatus}.`,
      );
    }

    const updatedTask = await client.query(
      `UPDATE application_tasks
       SET status = $1,
           updated_at = NOW()
       WHERE task_id = $2
       RETURNING task_id, uarn, target_department, status, updated_at`,
      [normalisedStatus, taskId],
    );

    // Re-evaluate overall application status
    // If ALL tasks for this UARN are now COMPLETED, set overall to COMPLETED
    // If any task is FAILED and no tasks are still PROCESSING/READY, set overall to COMPLETED (partial)
    let newOverallStatus = null;
    if (['COMPLETED', 'FAILED'].includes(normalisedStatus)) {
      const siblingResult = await client.query(
        `SELECT status, COUNT(*)::int AS cnt
         FROM application_tasks
         WHERE uarn = $1
         GROUP BY status`,
        [task.uarn],
      );

      const statusCounts = {};
      for (const row of siblingResult.rows) {
        statusCounts[row.status] = row.cnt;
      }

      const hasReady = (statusCounts.READY || 0) > 0;
      const hasProcessing = (statusCounts.PROCESSING || 0) > 0;

      if (!hasReady && !hasProcessing) {
        // All tasks have reached a terminal state
        newOverallStatus = 'COMPLETED';
      } else if (normalisedStatus === 'PROCESSING' || hasProcessing) {
        newOverallStatus = 'PROCESSING';
      }
    } else if (normalisedStatus === 'PROCESSING' && task.overall_status === 'APPROVED') {
      newOverallStatus = 'PROCESSING';
    }

    let updatedApplication = null;
    if (newOverallStatus && newOverallStatus !== task.overall_status) {
      const appResult = await client.query(
        `UPDATE applications
         SET overall_status = $1
         WHERE uarn = $2
         RETURNING uarn, global_id, trigger_event, overall_status, created_at`,
        [newOverallStatus, task.uarn],
      );
      updatedApplication = appResult.rows[0];
    }

    await recordAuditEvent(client, {
      uarn: task.uarn,
      globalId: task.global_id,
      department: task.target_department,
      event: task.trigger_event,
      action: `TASK_${normalisedStatus}`,
      actor: actor || 'Department Officer',
    });

    await client.query('COMMIT');

    return {
      task: updatedTask.rows[0],
      application: updatedApplication,
      previousStatus: currentStatus,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Task status update rollback failed:',
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
  updateTaskStatus,
};