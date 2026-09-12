/**
 * Authentication Middleware
 * Validates OIDC JWT Bearer tokens from the Authorization header.
 */

const { verifyJwt } = require('../utils/jwt.util');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid Authorization Bearer token.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const claims = verifyJwt(token);
    req.user = claims;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: `Unauthorized: ${error.message}`,
      code: 'AUTH_TOKEN_INVALID',
    });
  }
}

function optionalAuthenticate(req, _res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (token) {
    try {
      req.user = verifyJwt(token);
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuthenticate,
};
