const { middlewarePool, legacyPool } = require('../config/db');
const {
  updateConsentDecision,
  updateTaskStatus,
} = require('../services/application.service');
const { resolveAndExecute } = require('../services/connector/connectorResolver.service');
const { recordAuditEvent } = require('../services/audit.service');
const { HttpError } = require('../utils/httpError');

async function syncMmvyApplications(globalId = null) {
  try {
    let mappingsQuery = `SELECT global_id, legacy_id FROM main_global_db WHERE department_name = 'MMVY'`;
    let mappingsParams = [];
    if (globalId) {
      mappingsQuery += ` AND global_id = $1`;
      mappingsParams.push(globalId);
    }
    const mappingsRes = await middlewarePool.query(mappingsQuery, mappingsParams);
    if (mappingsRes.rows.length === 0 && globalId && globalId.startsWith('GLOBAL-MMVY-')) {
      mappingsRes.rows.push({
        global_id: globalId,
        legacy_id: globalId.replace('GLOBAL-', ''),
      });
    }

    for (const mapping of mappingsRes.rows) {
      const neonAppsRes = await legacyPool.query(
        `SELECT * FROM mmvy_applications WHERE user_id = $1`,
        [mapping.legacy_id],
      );

      for (const mmvyApp of neonAppsRes.rows) {
        const uarn = `UARN-MMVY-${mmvyApp.application_id}`;
        const existing = await middlewarePool.query(
          `SELECT uarn FROM applications WHERE uarn = $1`,
          [uarn],
        );

        if (existing.rows.length === 0) {
          await middlewarePool.query(
            `INSERT INTO applications (uarn, global_id, trigger_event, overall_status, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              uarn,
              mapping.global_id,
              'Scholarship_Application',
              'APPROVED',
              mmvyApp.submitted_at || new Date(),
            ],
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'Revenue_Department', 'READY'],
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'Higher_Education', 'READY'],
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'UIDAI', 'COMPLETED'],
          );

          await recordAuditEvent(middlewarePool, {
            uarn,
            globalId: mapping.global_id,
            department: 'MMVY',
            event: 'Scholarship_Application',
            action: `MMVY Application ${mmvyApp.application_id} (${mmvyApp.scheme_name}) synchronized into cross-department verification workflow`,
            actor: 'MMVY Portal Gateway',
          });
        }
      }
    }
  } catch (err) {
    console.error('Error syncing MMVY applications:', err.message);
  }
}

function validGlobalId(value) {
  if (
    typeof value !== 'string' ||
    value.trim() === '' ||
    value.length > 255
  ) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'global_id must be a non-empty value up to 255 characters.',
    );
  }

  return value.trim();
}

async function getPendingApplications(req, res, next) {
  try {
    const globalId = validGlobalId(req.params.global_id);

    const result = await middlewarePool.query(
      `SELECT
         a.uarn,
         a.global_id,
         a.trigger_event,
         a.overall_status,
         a.created_at,
         t.task_id,
         t.target_department,
         t.status AS task_status
       FROM applications AS a
       LEFT JOIN application_tasks AS t
         ON t.uarn = a.uarn
       WHERE a.global_id = $1
         AND a.overall_status = 'PENDING_CONSENT'
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
      data: {
        global_id: globalId,
        count: applications.length,
        applications,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getCitizenApplications(req, res, next) {
  try {
    const globalId = validGlobalId(req.params.global_id);

    // Sync any newly submitted MMVY scholarship applications from Neon
    await syncMmvyApplications(globalId);

    const result = await middlewarePool.query(
      `SELECT
         a.uarn,
         a.global_id,
         a.trigger_event,
         a.overall_status,
         a.created_at,
         t.task_id,
         t.target_department,
         t.status AS task_status,
         t.updated_at AS task_updated_at
       FROM applications AS a
       LEFT JOIN application_tasks AS t
         ON t.uarn = a.uarn
       WHERE a.global_id = $1
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
          updated_at: row.task_updated_at,
        });
      }
    }

    const applications = [...byUarn.values()];

    return res.status(200).json({
      data: {
        global_id: globalId,
        count: applications.length,
        applications,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllApplications(_req, res, next) {
  try {
    // Sync any newly submitted MMVY applications from Neon
    await syncMmvyApplications();

    const result = await middlewarePool.query(
      `SELECT
         a.uarn,
         a.global_id,
         a.trigger_event,
         a.overall_status,
         a.created_at,
         t.task_id,
         t.target_department,
         t.status AS task_status,
         t.updated_at AS task_updated_at
       FROM applications AS a
       LEFT JOIN application_tasks AS t
         ON t.uarn = a.uarn
       ORDER BY a.created_at DESC, t.task_id ASC`,
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
          updated_at: row.task_updated_at,
        });
      }
    }

    const applications = [...byUarn.values()];

    return res.status(200).json({
      data: {
        count: applications.length,
        applications,
      },
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

async function getApplicationByUarn(req, res, next) {
  try {
    const uarn = validGlobalId(req.params.uarn);

    const result = await middlewarePool.query(
      `SELECT
         a.uarn,
         a.global_id,
         a.trigger_event,
         a.overall_status,
         a.created_at,
         t.task_id,
         t.target_department,
         t.status AS task_status,
         t.updated_at AS task_updated_at
       FROM applications AS a
       LEFT JOIN application_tasks AS t
         ON t.uarn = a.uarn
       WHERE a.uarn = $1
       ORDER BY t.task_id ASC`,
      [uarn],
    );

    if (result.rowCount === 0) {
      throw new HttpError(
        404,
        'APPLICATION_NOT_FOUND',
        `Application "${uarn}" was not found.`,
      );
    }

    const application = {
      uarn: result.rows[0].uarn,
      global_id: result.rows[0].global_id,
      trigger_event: result.rows[0].trigger_event,
      overall_status: result.rows[0].overall_status,
      created_at: result.rows[0].created_at,
      tasks: [],
    };

    for (const row of result.rows) {
      if (row.task_id !== null) {
        application.tasks.push({
          task_id: row.task_id,
          target_department: row.target_department,
          status: row.task_status,
          updated_at: row.task_updated_at,
        });
      }
    }

    return res.status(200).json({
      data: application,
    });
  } catch (error) {
    return next(error);
  }
}
async function getDepartmentTasks(req, res, next) {
  try {
    const department = validGlobalId(req.params.department);

    // Sync any newly submitted MMVY applications so tasks appear in department work queue
    await syncMmvyApplications();

    const result = await middlewarePool.query(
      `SELECT
         a.uarn,
         a.global_id,
         a.trigger_event,
         a.overall_status,
         a.created_at,
         t.task_id,
         t.target_department,
         t.status AS task_status,
         t.updated_at AS task_updated_at
       FROM application_tasks AS t
       INNER JOIN applications AS a
         ON a.uarn = t.uarn
       WHERE t.target_department = $1
       ORDER BY t.updated_at DESC, t.task_id DESC`,
      [department],
    );

    const tasks = result.rows.map((row) => ({
      uarn: row.uarn,
      global_id: row.global_id,
      trigger: row.trigger_event,
      request: getRequestDescription(row.trigger_event),
      department: row.target_department,
      status: row.task_status,
      created: row.created_at,
      updated_at: row.task_updated_at,
      connectorType: 'API Connector',
      taskId: row.task_id,
    }));

    return res.status(200).json({
      data: {
        department,
        count: tasks.length,
        tasks,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function getRequestDescription(triggerEvent) {
  const descriptions = {
    Address_Update: 'Address Synchronization',
    Name_Update: 'Name Synchronization',
    Date_of_Birth_Update: 'Date of Birth Synchronization',
    Mobile_Number_Update: 'Mobile Number Synchronization',
    Email_Update: 'Email Synchronization',
    Income_Update: 'Income Verification',
    Caste_Update: 'Caste Verification',
    Disability_Update: 'Disability Verification',
    Marital_Status_Update: 'Marital Status Synchronization',
    Bank_Account_Update: 'Bank Account Synchronization',
    Domicile_Update: 'Domicile Verification',
    Education_Update: 'Education Verification',
    Employment_Update: 'Employment Verification',
    Property_Update: 'Property Verification',
    Vehicle_Update: 'Vehicle Verification',
    Death_Update: 'Death Record Synchronization',
  };

  return descriptions[triggerEvent] || 'Cross-Department Synchronization';
}

async function updateTaskStatusHandler(req, res, next) {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId) || taskId < 1) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'taskId must be a positive integer.',
      );
    }

    const requestedStatus = req.body?.status || req.body?.newStatus;
    const shouldExecute = req.body?.execute ?? req.body?.executeConnector ?? false;

    if (typeof requestedStatus !== 'string' || requestedStatus.trim() === '') {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'status is required (PROCESSING, COMPLETED, or FAILED).',
      );
    }

    const actor = req.user?.email || req.user?.sub || 'Department Officer';

    const result = await updateTaskStatus({
      middlewarePool,
      taskId,
      newStatus: requestedStatus.trim().toUpperCase(),
      actor,
    });

    // If the caller requested connector execution and the task moved to PROCESSING,
    // dispatch through the Connector Resolver (API or RPA) and auto-advance.
    let connectorResult = null;
    if (shouldExecute && result.task.status === 'PROCESSING') {
      try {
        connectorResult = await resolveAndExecute({
          department: result.task.target_department,
          triggerEvent: result.task.trigger_event || 'synchronization',
          uarn: result.task.uarn,
        });

        // Auto-advance to COMPLETED or FAILED after connector execution
        const completionResult = await updateTaskStatus({
          middlewarePool,
          taskId,
          newStatus: connectorResult.success ? 'COMPLETED' : 'FAILED',
          actor,
        });

        result.task = completionResult.task;
        result.application = completionResult.application || result.application;
      } catch (connectorError) {
        // Connector failure should not break the response
        console.error('Connector execution error:', connectorError.message);
        connectorResult = { success: false, message: connectorError.message, connectorType: 'UNKNOWN' };
      }
    }

    return res.status(200).json({
      data: {
        ...result,
        connector: connectorResult,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getDepartmentMetrics(req, res, next) {
  try {
    const department = validGlobalId(req.params.department);

    const result = await middlewarePool.query(
      `SELECT t.status, COUNT(*)::int AS count
       FROM application_tasks AS t
       WHERE t.target_department = $1
       GROUP BY t.status`,
      [department],
    );

    const counts = {};
    for (const row of result.rows) {
      counts[row.status] = row.count;
    }

    return res.status(200).json({
      data: {
        department,
        newRequests: (counts.READY || 0) + (counts.WAITING || 0),
        inProgress: counts.PROCESSING || 0,
        completed: counts.COMPLETED || 0,
        failed: counts.FAILED || 0,
        waiting: counts.WAITING || 0,
        ready: counts.READY || 0,
        cancelled: counts.CANCELLED || 0,
        slaAtRisk: 0,
        avgProcessingTime: 'N/A',
        uptime: '99.9%',
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getSystemMetrics(_req, res, next) {
  try {
    const appResult = await middlewarePool.query(
      `SELECT overall_status, COUNT(*)::int AS count
       FROM applications
       GROUP BY overall_status`,
    );

    const taskResult = await middlewarePool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM application_tasks
       GROUP BY status`,
    );

    const deptResult = await middlewarePool.query(
      `SELECT COUNT(DISTINCT target_department)::int AS count
       FROM application_tasks`,
    );

    const appCounts = {};
    for (const row of appResult.rows) {
      appCounts[row.overall_status] = row.count;
    }

    const taskCounts = {};
    for (const row of taskResult.rows) {
      taskCounts[row.status] = row.count;
    }

    const totalTasks = Object.values(taskCounts).reduce((s, c) => s + c, 0);

    return res.status(200).json({
      data: {
        connectedDepartments: deptResult.rows[0]?.count || 0,
        activeWorkflows: (appCounts.APPROVED || 0) + (appCounts.PROCESSING || 0),
        pendingConsent: appCounts.PENDING_CONSENT || 0,
        readyTasks: taskCounts.READY || 0,
        failedTasks: taskCounts.FAILED || 0,
        completedTasks: taskCounts.COMPLETED || 0,
        processingTasks: taskCounts.PROCESSING || 0,
        totalTasks,
        eventsToday: totalTasks,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPendingApplications,
  getCitizenApplications,
  getAllApplications,
  updateApplicationConsent,
  getApplicationByUarn,
  getDepartmentTasks,
  updateTaskStatusHandler,
  getDepartmentMetrics,
  getSystemMetrics,
};