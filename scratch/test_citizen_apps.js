const { middlewarePool, legacyPool } = require('../backend/config/db');

(async () => {
  try {
    const apps = await middlewarePool.query('SELECT * FROM applications WHERE global_id = $1', ['GLOBAL-MMVY-00010002']);
    console.log('Middleware applications for Rahul:', apps.rows);

    const neonApps = await legacyPool.query('SELECT * FROM mmvy_applications WHERE user_id = $1', ['MMVY-00010002']);
    console.log('Neon applications for Rahul:', neonApps.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
