const { middlewarePool } = require('../config/db');
const { HttpError } = require('../utils/httpError');

function requiredIdentifier(value, name) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} is required and must be a string or number.`);
  }
  const identifier = String(value).trim();
  if (identifier.length > 255) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must not exceed 255 characters.`);
  }
  return identifier;
}

function requiredDepartmentName(value) {
  const departmentName = requiredIdentifier(value, 'department_name');
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,62}$/.test(departmentName)) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'department_name may contain only letters, numbers, underscores, or hyphens.',
    );
  }
  return departmentName;
}

async function upsertIdentity(req, res, next) {
  try {
    const departmentName = requiredDepartmentName(req.body && (req.body.department_name || req.body.departmentName));
    const legacyId = requiredIdentifier(req.body && (req.body.legacy_id || req.body.legacyId), 'legacy_id');
    const globalId = requiredIdentifier(req.body && (req.body.global_id || req.body.globalId), 'global_id');

    const result = await middlewarePool.query(
      `INSERT INTO main_global_db (department_name, legacy_id, global_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (department_name, legacy_id)
       DO UPDATE SET global_id = EXCLUDED.global_id
       RETURNING mapping_id, department_name, legacy_id, global_id`,
      [departmentName, legacyId, globalId],
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

async function listMappings(req, res, next) {
  try {
    const result = await middlewarePool.query(
      'SELECT mapping_id, department_name, legacy_id, global_id FROM main_global_db ORDER BY mapping_id DESC'
    );
    return res.status(200).json({ success: true, mappings: result.rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { upsertIdentity, listMappings };
