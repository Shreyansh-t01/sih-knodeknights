/**
 * MahaSetu API Adapters
 *
 * Live backend integration is used for:
 * - Department work queue
 * - Department task details
 *
 * Other subsystems still use mock data until their
 * corresponding backend endpoints are implemented.
 */

import { apiClient } from '../client';

import {
  MOCK_NOTIFICATIONS,
  MOCK_ACTIVE_PERMISSIONS,
  MOCK_DEPARTMENT_METRICS,
  MOCK_WORK_QUEUE,
  MOCK_WORKFLOW_TIMELINE,
  MOCK_ADMIN_METRICS,
  MOCK_CONNECTORS,
  MOCK_EXCEPTIONS,
  MOCK_AUDIT_LOGS,
} from '../../mock/mockData';

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

export const notificationsApi = {
  getNotifications: async () => {
    return Promise.resolve([...MOCK_NOTIFICATIONS]);
  },

  markAsRead: async (id) => {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);

    if (notif) {
      notif.read = true;
    }

    return Promise.resolve({
      success: true,
      id,
    });
  },

  markAllAsRead: async () => {
    MOCK_NOTIFICATIONS.forEach((n) => {
      n.read = true;
    });

    return Promise.resolve({
      success: true,
    });
  },
};

/* =========================================================
   ACTIVE PERMISSIONS
   ========================================================= */

export const activePermissionsApi = {
  getPermissions: async () => {
    return Promise.resolve([...MOCK_ACTIVE_PERMISSIONS]);
  },
};

/* =========================================================
   DEPARTMENT HELPERS
   ========================================================= */

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
    Vehicle_Update: 'Vehicle Synchronization',
    Death_Update: 'Death Record Synchronization',
  };

  return (
    descriptions[triggerEvent] ||
    'Cross-Department Synchronization'
  );
}

/* =========================================================
   DEPARTMENT API
   ========================================================= */

export const departmentApi = {
  /*
   * Metrics
   *
   * LIVE BACKEND with fallback to mock data
   */
  getMetrics: async (departmentCode = 'Revenue_Department') => {
    try {
      const response = await apiClient.get(
        `/api/applications/department/${encodeURIComponent(departmentCode)}/metrics`
      );
      if (response?.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Failed to fetch real department metrics, falling back to mock:', err.message);
    }

    const metrics =
      MOCK_DEPARTMENT_METRICS[departmentCode] ||
      MOCK_DEPARTMENT_METRICS.Revenue_Department;

    return {
      ...metrics,
      department: departmentCode,
    };
  },

  /*
   * WORK QUEUE
   *
   * LIVE BACKEND
   *
   * Backend endpoint:
   * GET /api/applications/department/:department/tasks
   */
  getWorkQueue: async (departmentCode = 'Revenue_Department') => {
    if (!departmentCode) {
      throw new Error('departmentCode is required.');
    }

    const response = await apiClient.get(
      `/api/applications/department/${encodeURIComponent(
        departmentCode
      )}/tasks`
    );

    return response?.data?.tasks || [];
  },

  /*
   * TASK DETAILS
   *
   * LIVE BACKEND
   *
   * Backend endpoint:
   * GET /api/applications/:uarn
   *
   * The application endpoint returns all tasks belonging
   * to that UARN. We select the task belonging to the
   * currently active department.
   */
  getTaskDetails: async (
    uarn,
    departmentCode = 'Revenue_Department'
  ) => {
    if (!uarn) {
      throw new Error('uarn is required.');
    }

    if (!departmentCode) {
      throw new Error('departmentCode is required.');
    }

    const response = await apiClient.get(
      `/api/applications/${encodeURIComponent(uarn)}`
    );

    const application = response?.data;

    if (!application) {
      throw new Error('Application not found.');
    }

    const task = (application.tasks || []).find(
      (item) => item.target_department === departmentCode
    );

    if (!task) {
      throw new Error(
        `No task found for ${departmentCode} on application ${uarn}.`
      );
    }

    return {
      uarn: application.uarn,
      global_id: application.global_id,

      trigger: application.trigger_event,

      request: getRequestDescription(
        application.trigger_event
      ),

      department: task.target_department,

      status: task.status,

      created: application.created_at,

      updated: task.updated_at,

      taskId: task.task_id,

      /*
       * The real connector type will eventually come from
       * the connector/workflow subsystem.
       *
       * For now this is a UI-level representation.
       */
      connectorType: 'API Connector',

      /*
       * Timeline is still mock data.
       *
       * We should NOT pretend this is coming from the
       * backend until we implement a persistent workflow
       * event endpoint.
       */
      workflowTimeline: [...MOCK_WORKFLOW_TIMELINE],
    };
  },

  /*
   * TASK STATUS UPDATE & CONNECTOR EXECUTION
   *
   * LIVE BACKEND
   *
   * Backend endpoint:
   * PATCH /api/applications/tasks/:taskId/status
   */
  updateTaskStatus: async (taskId, newStatus, { executeConnector = false } = {}) => {
    if (!taskId) {
      throw new Error('taskId is required.');
    }

    const response = await apiClient.patch(
      `/api/applications/tasks/${encodeURIComponent(taskId)}/status`,
      {
        status: newStatus,
        newStatus,
        execute: executeConnector,
        executeConnector,
      }
    );

    return response?.data || response;
  },
};

/* =========================================================
   CONNECTORS
   ========================================================= */

export const connectorApi = {
  getConnectors: async () => {
    return Promise.resolve([...MOCK_CONNECTORS]);
  },

  testConnector: async (connectorId) => {
    return Promise.resolve({
      success: true,
      connectorId,
      latency: '120ms',
      status: 'Healthy',
    });
  },
};

/* =========================================================
   ADMIN
   ========================================================= */

export const adminApi = {
  getSystemMetrics: async () => {
    try {
      const response = await apiClient.get('/api/applications/metrics/system');
      if (response?.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Failed to fetch real system metrics:', err.message);
    }

    return {
      connectedDepartments: 0,
      activeWorkflows: 0,
      pendingConsent: 0,
      readyTasks: 0,
      failedTasks: 0,
      completedTasks: 0,
      processingTasks: 0,
      totalTasks: 0,
      eventsToday: 0,
    };
  },
};

/* =========================================================
   AUDIT
   ========================================================= */

export const auditApi = {
  getAuditLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.uarn) params.append('uarn', filters.uarn);
      if (filters.globalId) params.append('globalId', filters.globalId);
      if (filters.department && filters.department !== 'ALL') params.append('department', filters.department);
      if (filters.event && filters.event !== 'ALL') params.append('event', filters.event);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/api/audit${queryString}`);
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
    } catch (err) {
      console.warn('Failed to fetch real audit logs:', err.message);
    }

    return [];
  },
};

/* =========================================================
   WORKFLOW EXECUTION
   ========================================================= */

export const executionApi = {
  /*
   * Still mock because persistent workflow-event
   * tracking has not been implemented yet.
   */
  getWorkflowTimeline: async (uarn) => {
    return Promise.resolve([
      ...MOCK_WORKFLOW_TIMELINE,
    ]);
  },
};