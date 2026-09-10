const { randomUUID } = require('crypto');

function generateUarn() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  return `UARN-${timestamp}-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }
}

async function createApplicationWithTasks({ middlewarePool, globalId, triggerEvent, targets }) {
  assertNonEmptyString(globalId, 'globalId');
  assertNonEmptyString(triggerEvent, 'triggerEvent');
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new TypeError('targets must be a non-empty array.');
  }

  const uniqueTargets = [...new Set(targets.map((target) => String(target).trim()).filter(Boolean))];
  if (uniqueTargets.length === 0) {
    throw new TypeError('targets must contain at least one department name.');
  }

  const uarn = generateUarn();
  const client = await middlewarePool.connect();
  try {
    await client.query('BEGIN');
    const applicationResult = await client.query(
      `INSERT INTO applications (uarn, global_id, trigger_event, overall_status, created_at)
       VALUES ($1, $2, $3, 'PENDING_CONSENT', NOW())
       RETURNING uarn, global_id, trigger_event, overall_status, created_at`,
      [uarn, globalId, triggerEvent],
    );

    const tasks = [];
    for(const targetDepartment of uniqueTargets) {
      const taskResult = await client.query(
        `INSERT INTO application_tasks (uarn, target_department, status)
         VALUES ($1, $2, 'WAITING')
         RETURNING task_id, uarn, target_department, status`,
        [uarn, targetDepartment],
      );
      tasks.push(taskResult.rows[0]);
    }

    await client.query('COMMIT');
    return { application: applicationResult.rows[0], tasks };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Application transaction rollback failed:', rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { generateUarn, createApplicationWithTasks };


