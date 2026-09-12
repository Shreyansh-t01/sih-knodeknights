const express = require('express');

const {
  getPendingApplications,
  getCitizenApplications,
  getAllApplications,
  updateApplicationConsent,
  getApplicationByUarn,
  getDepartmentTasks,
  updateTaskStatusHandler,
  getDepartmentMetrics,
  getSystemMetrics,
} = require('../controllers/application.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  requireRole,
  requireDepartmentScope,
  requireCitizenScope,
} = require('../middleware/rbac.middleware');

const router = express.Router();

// Citizen scoped applications
router.get('/pending/:global_id', authenticateToken, requireCitizenScope(), getPendingApplications);
router.get('/citizen/:global_id', authenticateToken, requireCitizenScope(), getCitizenApplications);
router.post('/:uarn/consent', authenticateToken, requireRole('CITIZEN', 'MAHASETU_ADMIN'), updateApplicationConsent);

// All applications for Admin and Auditor oversight
router.get('/all', authenticateToken, requireRole('MAHASETU_ADMIN', 'AUDITOR', 'DEPARTMENT_ADMIN'), getAllApplications);

// Metrics
router.get('/metrics/system', authenticateToken, requireRole('MAHASETU_ADMIN', 'AUDITOR', 'DEPARTMENT_ADMIN'), getSystemMetrics);
router.get('/department/:department/metrics', authenticateToken, requireDepartmentScope(), getDepartmentMetrics);

// Department tasks
router.get('/department/:department/tasks', authenticateToken, requireDepartmentScope(), getDepartmentTasks);
router.patch('/tasks/:taskId/status', authenticateToken, requireRole('DEPARTMENT_OFFICER', 'DEPARTMENT_ADMIN', 'MAHASETU_ADMIN'), updateTaskStatusHandler);

// Application details / tracking (all authenticated roles)
router.get('/:uarn', authenticateToken, getApplicationByUarn);

module.exports = router;