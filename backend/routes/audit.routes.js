const express = require('express');
const { getAuditLogsHandler } = require('../controllers/audit.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authenticateToken, requireRole('MAHASETU_ADMIN', 'AUDITOR'), getAuditLogsHandler);

module.exports = router;

