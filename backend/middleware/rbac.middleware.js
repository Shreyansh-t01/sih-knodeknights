/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces fine-grained authorization boundaries on API routes.
 */

function normalizeDept(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Require one of the specified roles
 * @param  {...string} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const { role } = req.user;

    // MAHASETU_ADMIN has overarching privileges across all roles
    if (role === 'MAHASETU_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${role}' is not authorized to access this resource. Allowed: ${allowedRoles.join(', ')}`,
        code: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
}

/**
 * Require that a department officer or department admin only accesses tasks for their own department
 */
function requireDepartmentScope() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const { role, department } = req.user;

    // Super-admins and Auditors can view across departments
    if (role === 'MAHASETU_ADMIN' || (role === 'AUDITOR' && req.method === 'GET')) {
      return next();
    }

    const requestedDept = req.params.department || req.body.department;
    if (!requestedDept) {
      return next();
    }

    if (normalizeDept(department) !== normalizeDept(requestedDept)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access denied. Officer assigned to '${department}' cannot access resources for '${requestedDept}'.`,
        code: 'FORBIDDEN_DEPARTMENT_MISMATCH',
      });
    }

    next();
  };
}

/**
 * Require that a citizen can only access their own global_id records
 */
function requireCitizenScope() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const { role, global_id, sub } = req.user;

    // MAHASETU_ADMIN can inspect records for debugging/support
    if (role === 'MAHASETU_ADMIN') {
      return next();
    }

    if (role !== 'CITIZEN') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Only citizens can access individual citizen dossiers.`,
        code: 'FORBIDDEN_NOT_CITIZEN',
      });
    }

    const requestedId = req.params.global_id || req.body.global_id;
    if (requestedId && requestedId !== global_id && requestedId !== sub) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You cannot access applications belonging to another citizen identity (${requestedId}).`,
        code: 'FORBIDDEN_CITIZEN_MISMATCH',
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireDepartmentScope,
  requireCitizenScope,
};
