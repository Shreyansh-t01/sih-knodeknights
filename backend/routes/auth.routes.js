const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public SSO Login / Token Exchange
router.post('/sso/login', authController.loginSSO);
router.post('/login', authController.loginSSO);

// Public Persona list for prototype testing
router.get('/personas', authController.getPersonas);

// Protected UserInfo endpoint (OIDC standard)
router.get('/userinfo', authenticateToken, authController.getUserInfo);

// Protected live citizen profile directly from authoritative Neon PostgreSQL
router.get('/citizen/:globalId', authenticateToken, authController.getCitizenProfile);

module.exports = router;
