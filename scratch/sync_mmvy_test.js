const { middlewarePool, legacyPool } = require('../backend/config/db');

(async () => {
  try {
    const mappingsRes = await middlewarePool.query(
      `SELECT global_id, legacy_id FROM main_global_db WHERE department_name = 'MMVY'`
    );
    console.log('MMVY Mappings in MDM:', mappingsRes.rows);

    for (const mapping of mappingsRes.rows) {
      const neonAppsRes = await legacyPool.query(
        `SELECT * FROM mmvy_applications WHERE user_id = $1`,
        [mapping.legacy_id]
      );
      console.log(`Neon apps for ${mapping.legacy_id}:`, neonAppsRes.rows.map(a => a.application_id));

      for (const mmvyApp of neonAppsRes.rows) {
        const uarn = `UARN-MMVY-${mmvyApp.application_id}`;
        const existing = await middlewarePool.query('SELECT uarn FROM applications WHERE uarn = $1', [uarn]);
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
            ]
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'Revenue_Department', 'READY']
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'Higher_Education', 'READY']
          );

          await middlewarePool.query(
            `INSERT INTO application_tasks (uarn, target_department, status)
             VALUES ($1, $2, $3)`,
            [uarn, 'UIDAI', 'COMPLETED']
          );

          await middlewarePool.query(
            `INSERT INTO audit_logs (uarn, global_id, department, event, action, actor, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              uarn,
              mapping.global_id,
              'MMVY',
              'Scholarship_Application',
              `MMVY Application ${mmvyApp.application_id} (${mmvyApp.scheme_name}) synchronized into cross-department verification workflow`,
              'MMVY Portal Gateway',
            ]
          );
          console.log(`Synced ${uarn} for ${mapping.global_id}`);
        } else {
          console.log(`Already exists: ${uarn}`);
        }
      }
    }

    const rahulApps = await middlewarePool.query('SELECT * FROM applications WHERE global_id = $1', ['GLOBAL-MMVY-00010002']);
    console.log('Rahul Patil applications now in middleware:', rahulApps.rows);

    const rahulTasks = await middlewarePool.query('SELECT * FROM application_tasks WHERE uarn = $1', ['UARN-MMVY-APP-00050002']);
    console.log('Rahul Patil tasks in middleware:', rahulTasks.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
