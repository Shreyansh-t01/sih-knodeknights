/**
 * MahaSetu Mock Adapters
 * Provides async service abstractions for subsystems without live backend endpoints.
 * All functions return Promises to match real API behavior.
 */

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

export const notificationsApi = {
  getNotifications: async () => {
    return Promise.resolve([...MOCK_NOTIFICATIONS]);
  },
  markAsRead: async (id) => {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) notif.read = true;
    return Promise.resolve({ success: true, id });
  },
  markAllAsRead: async () => {
    MOCK_NOTIFICATIONS.forEach((n) => (n.read = true));
    return Promise.resolve({ success: true });
  },
};

export const activePermissionsApi = {
  getPermissions: async () => {
    return Promise.resolve([...MOCK_ACTIVE_PERMISSIONS]);
  },
};

export const departmentApi = {
  getMetrics: async (departmentCode = 'Revenue_Department') => {
    const metrics = MOCK_DEPARTMENT_METRICS[departmentCode] || MOCK_DEPARTMENT_METRICS.Revenue_Department;
    return Promise.resolve({ ...metrics });
  },
  getWorkQueue: async (departmentCode = 'Revenue_Department') => {
    const queue = MOCK_WORK_QUEUE.filter(
      (item) => !departmentCode || item.department === departmentCode || departmentCode === 'ALL'
    );
    return Promise.resolve(queue.length > 0 ? queue : MOCK_WORK_QUEUE);
  },
  getTaskDetails: async (uarn) => {
    const item = MOCK_WORK_QUEUE.find((q) => q.uarn === uarn) || MOCK_WORK_QUEUE[0];
    return Promise.resolve({
      ...item,
      workflowTimeline: MOCK_WORKFLOW_TIMELINE,
    });
  },
};

export const connectorApi = {
  getConnectors: async () => {
    return Promise.resolve([...MOCK_CONNECTORS]);
  },
  testConnector: async (connectorId) => {
    return Promise.resolve({ success: true, connectorId, latency: '120ms', status: 'Healthy' });
  },
};

export const adminApi = {
  getSystemMetrics: async () => {
    return Promise.resolve({ ...MOCK_ADMIN_METRICS });
  },
  getExceptions: async () => {
    return Promise.resolve([...MOCK_EXCEPTIONS]);
  },
  retryException: async (id) => {
    return Promise.resolve({ success: true, id, status: 'Retry Scheduled' });
  },
};

export const auditApi = {
  getAuditLogs: async (filters = {}) => {
    let logs = [...MOCK_AUDIT_LOGS];
    if (filters.uarn) {
      logs = logs.filter((l) => l.uarn.toLowerCase().includes(filters.uarn.toLowerCase()));
    }
    if (filters.globalId) {
      logs = logs.filter((l) => l.globalId.toLowerCase().includes(filters.globalId.toLowerCase()));
    }
    if (filters.department && filters.department !== 'ALL') {
      logs = logs.filter((l) => l.department.toLowerCase().includes(filters.department.toLowerCase()));
    }
    if (filters.event && filters.event !== 'ALL') {
      logs = logs.filter((l) => l.event === filters.event);
    }
    return Promise.resolve(logs);
  },
};

export const executionApi = {
  getWorkflowTimeline: async (uarn) => {
    return Promise.resolve([...MOCK_WORKFLOW_TIMELINE]);
  },
};
