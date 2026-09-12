/**
 * MahaSetu Audit Service
 *
 * Records immutable audit events for the platform lifecycle:
 * CDC detection, identity mapping, UARN creation, consent,
 * task state transitions, and connector execution.
 *
 * No sensitive citizen PII is stored in audit records.
 */

async function recordAuditEvent(pool, {
  uarn = null,
  globalId = null,
  department = null,
  event,
  action,
  actor = 'MahaSetu',
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs
       (uarn, global_id, department, event, action, actor, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uarn, globalId, department, event, action, actor],
    );
  } catch (error) {
    // Audit failures must never block the main workflow
    console.error('Audit record failed (non-blocking):', error.message);
  }
}

async function getAuditLogs(pool, filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.uarn) {
    params.push(`%${filters.uarn}%`);
    conditions.push(`uarn ILIKE $${params.length}`);
  }

  if (filters.globalId) {
    params.push(`%${filters.globalId}%`);
    conditions.push(`global_id ILIKE $${params.length}`);
  }

  if (filters.department && filters.department !== 'ALL') {
    params.push(`%${filters.department}%`);
    conditions.push(`department ILIKE $${params.length}`);
  }

  if (filters.event && filters.event !== 'ALL') {
    params.push(filters.event);
    conditions.push(`event = $${params.length}`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const result = await pool.query(
    `SELECT id, uarn, global_id, department, event, action, actor, created_at
     FROM audit_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT 200`,
    params,
  );

  return result.rows.map((row) => ({
    id: `aud-${row.id}`,
    timestamp: row.created_at,
    uarn: row.uarn,
    globalId: row.global_id,
    department: row.department,
    event: row.event,
    action: row.action,
    actor: row.actor,
  }));
}

module.exports = { recordAuditEvent, getAuditLogs };
