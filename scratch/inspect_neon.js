const { Pool } = require('d:/sih/mmvy-portal_clone/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_r0tMiYVcK8kw@ep-late-water-ae2bq3cm.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables in Neon:', tablesRes.rows.map(r => r.table_name));

    for (const row of tablesRes.rows) {
      const tbl = row.table_name;
      const countRes = await pool.query(`SELECT count(*) FROM "${tbl}"`);
      console.log(`\n================= TABLE: ${tbl} (${countRes.rows[0].count} rows) =================`);
      const sampleRes = await pool.query(`SELECT * FROM "${tbl}" LIMIT 10`);
      console.log(JSON.stringify(sampleRes.rows, null, 2));
    }
  } catch (err) {
    console.error('Error querying Neon:', err);
  } finally {
    await pool.end();
  }
}

run();
