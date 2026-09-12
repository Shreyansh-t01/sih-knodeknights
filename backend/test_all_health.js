const { signJwt } = require('./utils/jwt.util');
const { middlewarePool, legacyPool } = require('./config/db');

const BASE_URL = 'http://localhost:3000';

async function runHealthCheck() {
  console.log('=====================================================');
  console.log('   MAHASETU COMPREHENSIVE END-TO-END HEALTH CHECK    ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, ok, details = '') {
    if (ok) {
      console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  }

  // 1. Database Checks
  try {
    const mwCheck = await middlewarePool.query('SELECT NOW() as ts');
    report('Middleware DB Connection', mwCheck.rows.length > 0, `Postgres connected at ${mwCheck.rows[0].ts}`);
  } catch (err) {
    report('Middleware DB Connection', false, err.message);
  }

  try {
    const legacyCheck = await legacyPool.query('SELECT count(*) as count FROM mmvy_users');
    report('Neon Legacy DB Connection', legacyCheck.rows.length > 0, `${legacyCheck.rows[0].count} real users`);
  } catch (err) {
    report('Neon Legacy DB Connection', false, err.message);
  }

  // 2. Health / Root Route
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    report('Root Health Endpoint (GET /)', res.status === 200 && data.message.includes('running'));
  } catch (err) {
    report('Root Health Endpoint (GET /)', false, err.message);
  }

  // 3. Auth Endpoints: Real Citizen Login from Neon
  let citizenToken = null;
  let citizenGlobalId = 'GLOBAL-MMVY-00010001';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'MMVY-00010001', pin: '123456' }),
    });
    const data = await res.json();
    citizenToken = data.token;
    citizenGlobalId = data.user?.global_id || citizenGlobalId;
    report('Citizen Login via Neon Database (POST /api/auth/login)', res.status === 200 && !!citizenToken, `Logged in as ${data.user?.name} (${citizenGlobalId})`);
  } catch (err) {
    report('Citizen Login via Neon Database', false, err.message);
  }

  // 4. Auth Endpoints: Department Officer Login
  let officerToken = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'officer_revenue', pin: '123456' }),
    });
    const data = await res.json();
    officerToken = data.token;
    report('Officer Login (Revenue Department)', res.status === 200 && !!officerToken, `Role: ${data.user?.role}, Dept: ${data.user?.department}`);
  } catch (err) {
    report('Officer Login (Revenue Department)', false, err.message);
  }

  // 5. Auth Endpoints: Admin Login
  let adminToken = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin_mahasetu', pin: '123456' }),
    });
    const data = await res.json();
    adminToken = data.token;
    report('Admin Login (Super Admin)', res.status === 200 && !!adminToken, `Role: ${data.user?.role}`);
  } catch (err) {
    report('Admin Login (Super Admin)', false, err.message);
  }

  // 6. Citizen Applications Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/applications/citizen/${encodeURIComponent(citizenGlobalId)}`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const data = await res.json();
    report('Citizen Applications (GET /api/applications/citizen/:id)', res.status === 200, `Found ${data.data?.applications?.length || 0} applications`);
  } catch (err) {
    report('Citizen Applications', false, err.message);
  }

  // 7. Officer Tasks Queue Endpoint
  let sampleTaskId = null;
  let sampleTaskStatus = null;
  try {
    const res = await fetch(`${BASE_URL}/api/applications/department/Revenue_Department/tasks`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const data = await res.json();
    const tasks = data.data?.tasks || [];
    const readyTask = tasks.find((t) => t.status === 'READY') || tasks.find((t) => t.status === 'PROCESSING');
    if (readyTask) {
      sampleTaskId = readyTask.taskId;
      sampleTaskStatus = readyTask.status;
    } else {
      const resetRes = await middlewarePool.query(
        `SELECT task_id FROM application_tasks WHERE target_department = 'Revenue_Department' ORDER BY task_id DESC LIMIT 1`
      );
      if (resetRes.rows.length > 0) {
        sampleTaskId = resetRes.rows[0].task_id;
        await middlewarePool.query(
          `UPDATE application_tasks SET status = 'READY' WHERE task_id = $1`,
          [sampleTaskId]
        );
        sampleTaskStatus = 'READY';
      }
    }
    report('Officer Work Queue (GET /api/applications/department/:dept/tasks)', res.status === 200, `Found ${tasks.length} tasks in Revenue Dept queue`);
  } catch (err) {
    report('Officer Work Queue', false, err.message);
  }

  // 8. Officer Department Metrics
  try {
    const res = await fetch(`${BASE_URL}/api/applications/department/Revenue_Department/metrics`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const data = await res.json();
    report('Officer Department Metrics (GET /api/applications/department/:dept/metrics)', res.status === 200, `Total tasks: ${data.data?.total || 0}`);
  } catch (err) {
    report('Officer Department Metrics', false, err.message);
  }

  // 9. Admin System Metrics
  try {
    const res = await fetch(`${BASE_URL}/api/applications/metrics/system`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    report('Admin System Metrics (GET /api/applications/metrics/system)', res.status === 200, `Total apps: ${data.data?.totalApplications || 0}`);
  } catch (err) {
    report('Admin System Metrics', false, err.message);
  }

  // 10. Admin All Applications
  try {
    const res = await fetch(`${BASE_URL}/api/applications/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    report('Admin All Applications (GET /api/applications/all)', res.status === 200, `Total apps: ${data.data?.count || 0}`);
  } catch (err) {
    report('Admin All Applications', false, err.message);
  }

  // 11. Immutable Audit Trail Query
  try {
    const res = await fetch(`${BASE_URL}/api/audit`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    report('Audit Trail Endpoint (GET /api/audit)', res.status === 200, `Retrieved ${data.data?.logs?.length || 0} immutable logs`);
  } catch (err) {
    report('Audit Trail Endpoint', false, err.message);
  }

  // 12. Task Status Update & Connector Execution (PATCH /api/applications/tasks/:taskId/status)
  if (sampleTaskId) {
    try {
      const res = await fetch(`${BASE_URL}/api/applications/tasks/${sampleTaskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${officerToken}`,
        },
        body: JSON.stringify({
          status: 'PROCESSING',
          execute: true,
        }),
      });
      const data = await res.json();
      report(
        'Officer Task Status Update & Connector Execution (PATCH /api/applications/tasks/:taskId/status)',
        res.status === 200,
        `Task #${sampleTaskId} status: ${data.data?.task?.status || 'updated'}, connector: ${data.data?.connector?.connectorType || 'None'}`
      );
    } catch (err) {
      report('Officer Task Status Update', false, err.message);
    }
  } else {
    console.log('⚠️ Skipping Task Status Update: No tasks in queue');
  }

  // 13. Intelligence Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/intelligence/analyze-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'Revenue_Department',
        fields: ['address', 'income', 'caste'],
      }),
    });
    const data = await res.json();
    report('AI Intelligence Endpoint (POST /api/intelligence/analyze-form)', res.status === 200, `Confidence: ${data.data?.confidence || 'OK'}`);
  } catch (err) {
    report('AI Intelligence Endpoint', false, err.message);
  }

  // 14. MDM Identity Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/mdm/identity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department_name: 'MMVY',
        legacy_id: 'MMVY-00010001',
        global_id: 'GLOBAL-MMVY-00010001',
      }),
    });
    const data = await res.json();
    report('MDM Identity Resolution (POST /api/mdm/identity)', (res.status === 200 || res.status === 201), `Global ID: ${data.data?.global_id || data.globalId || 'OK'}`);
  } catch (err) {
    report('MDM Identity Resolution', false, err.message);
  }

  // 15. RPA Microservice Reachability Check
  try {
    const res = await fetch('https://rpa-bot-production.up.railway.app/api/bots');
    const data = await res.json();
    report('RPA Microservice on Railway', res.status === 200 && data.count > 0, `Bots available: ${data.count}`);
  } catch (err) {
    report('RPA Microservice on Railway', false, err.message);
  }

  console.log('\n=====================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runHealthCheck().catch((e) => {
  console.error('Fatal health check error:', e);
  process.exit(1);
});
