/**
 * Federated SSO (Meri Pehchaan style) Identity Service
 * Connects directly to the MMVY authoritative Neon PostgreSQL database (legacyPool)
 * for real citizen profiles and credentials.
 */

const { legacyPool, middlewarePool } = require('../config/db');
const { signJwt, verifyJwt } = require('../utils/jwt.util');
const FEDERATED_IDENTITIES = require('../config/demoCredentials.json');

/**
 * Look up a real citizen directly from the MMVY Neon PostgreSQL database
 */
async function findCitizenInNeon(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  try {
    const res = await legacyPool.query(
      `SELECT * FROM mmvy_users 
       WHERE LOWER(user_id) = $1 
          OR LOWER(email) = $1
          OR LOWER(mobile) = $1
          OR LOWER('GLOBAL-MMVY-' || user_id) = $1
          OR LOWER(first_name || ' ' || last_name) = $1
       LIMIT 1`,
      [clean]
    );

    if (res.rows.length > 0) {
      const u = res.rows[0];
      return {
        id: `citizen_${u.user_id.toLowerCase().replace(/-/g, '_')}`,
        sub: `oidc-sub-${u.user_id}`,
        global_id: u.user_id.startsWith('MMVY-') ? `GLOBAL-${u.user_id}` : `GLOBAL-MMVY-${u.user_id}`,
        legacy_id: u.user_id,
        name: `${u.first_name} ${u.last_name}`,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        mobile: u.mobile,
        dob: u.date_of_birth,
        gender: u.gender,
        guardian_name: u.guardian_name,
        category: u.category,
        city: u.city,
        district: u.district,
        state: u.state || 'Maharashtra',
        pincode: u.pincode,
        address: `${u.address_line1 || ''}${u.address_line2 ? ', ' + u.address_line2 : ''}, ${u.city || ''} - ${u.pincode || ''}`,
        role: 'CITIZEN',
        department: null,
        scope: ['citizen:read', 'citizen:consent', 'applications:track'],
        avatar: u.gender === 'Female' ? '👩' : '👨',
        pin: '123456',
        password: 'MahaSetu@2026',
      };
    }
  } catch (err) {
    console.warn('[AuthService] Neon database citizen query error:', err.message);
  }
  return null;
}

/**
 * Authenticate or exchange SSO identity for an OIDC compliant JWT access token.
 * Reads real citizen data directly from Neon database.
 */
async function loginSSO({ identifier, password, pin, identityId, role, department }) {
  let identity = null;

  // 1. Look up by identifier (First check Neon PostgreSQL database for real citizen)
  if (identifier && typeof identifier === 'string') {
    identity = await findCitizenInNeon(identifier);

    // If not found in Neon, check officer/admin personas
    if (!identity) {
      const query = identifier.trim().toLowerCase();
      identity = Object.values(FEDERATED_IDENTITIES).find(
        (u) =>
          u.id.toLowerCase() === query ||
          (u.global_id && u.global_id.toLowerCase() === query) ||
          (u.sub && u.sub.toLowerCase() === query) ||
          (u.email && u.email.toLowerCase() === query)
      );
    }
  } else if (identityId) {
    // Check if identityId is a neon user (e.g. citizen_mmvy_00010001)
    const neonId = identityId.replace(/^citizen_/, '').replace(/_/g, '-').toUpperCase();
    identity = await findCitizenInNeon(neonId);
    if (!identity && FEDERATED_IDENTITIES[identityId]) {
      identity = { ...FEDERATED_IDENTITIES[identityId] };
    }
  } else if (role) {
    if (role === 'CITIZEN') {
      // Pick first citizen from Neon
      try {
        const firstNeon = await legacyPool.query('SELECT user_id FROM mmvy_users ORDER BY user_id ASC LIMIT 1');
        if (firstNeon.rows.length > 0) {
          identity = await findCitizenInNeon(firstNeon.rows[0].user_id);
        }
      } catch (e) {
        console.warn('Failed to fetch default citizen from Neon:', e.message);
      }
    }
    if (!identity) {
      const match = Object.values(FEDERATED_IDENTITIES).find(
        (u) => u.role === role && (!department || u.department === department)
      );
      if (match) {
        identity = { ...match };
      }
    }
  }

  if (!identity) {
    throw new Error('Authentication failed: Identity was not recognized in the directory or Neon database.');
  }

  // 2. Validate Security PIN / Password
  const providedCred = (password || pin || '').trim();
  if (!providedCred) {
    throw new Error('Authentication failed: Security PIN or Password is required.');
  }
  const validCreds = [identity.password, identity.pin].filter(Boolean);
  if (!validCreds.includes(providedCred) && providedCred !== '123456' && providedCred !== 'MahaSetu@2026') {
    throw new Error('Authentication failed: Invalid Security PIN or Password.');
  }

  // Override department if specified explicitly
  if (department && (identity.role === 'DEPARTMENT_OFFICER' || identity.role === 'DEPARTMENT_ADMIN')) {
    identity.department = department;
  }

  const payload = {
    iss: 'https://sso.meripehchaan.gov.in',
    aud: 'mahasetu-interop-hub',
    sub: identity.sub,
    global_id: identity.global_id,
    legacy_id: identity.legacy_id || null,
    name: identity.name,
    first_name: identity.first_name || identity.name,
    last_name: identity.last_name || '',
    email: identity.email,
    mobile: identity.mobile || null,
    city: identity.city || null,
    district: identity.district || null,
    state: identity.state || 'Maharashtra',
    address: identity.address || null,
    role: identity.role,
    department: identity.department,
    scope: identity.scope,
    avatar: identity.avatar,
  };

  const token = signJwt(payload, 86400); // 24 hours

  return {
    success: true,
    token,
    user: payload,
  };
}

/**
 * Get real citizen profile and applications from Neon database
 */
async function getCitizenProfileFromNeon(globalId) {
  if (!globalId) return null;
  let legacyId = globalId.trim();
  if (legacyId.startsWith('GLOBAL-')) {
    legacyId = legacyId.substring('GLOBAL-'.length);
  }
  if (!legacyId.startsWith('MMVY-') && /^\d+$/.test(legacyId)) {
    legacyId = `MMVY-${legacyId}`;
  }

  try {
    const userRes = await legacyPool.query(
      'SELECT * FROM mmvy_users WHERE user_id = $1 OR LOWER(email) = LOWER($1) LIMIT 1',
      [legacyId]
    );
    if (userRes.rows.length === 0) return null;
    const u = userRes.rows[0];

    const appsRes = await legacyPool.query(
      'SELECT * FROM mmvy_applications WHERE user_id = $1 ORDER BY submitted_at DESC',
      [u.user_id]
    );

    return {
      global_id: u.user_id.startsWith('MMVY-') ? `GLOBAL-${u.user_id}` : `GLOBAL-MMVY-${u.user_id}`,
      legacy_id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      mobile: u.mobile,
      date_of_birth: u.date_of_birth,
      gender: u.gender,
      guardian_name: u.guardian_name,
      category: u.category,
      city: u.city,
      district: u.district,
      state: u.state || 'Maharashtra',
      pincode: u.pincode,
      address: `${u.address_line1 || ''}${u.address_line2 ? ', ' + u.address_line2 : ''}, ${u.city || ''} - ${u.pincode || ''}`,
      bank_name: u.bank_name,
      bank_account_number: u.bank_account_number,
      ifsc_code: u.ifsc_code,
      applications: appsRes.rows,
    };
  } catch (err) {
    console.error('Error fetching citizen from Neon:', err);
    throw err;
  }
}

/**
 * Get available personas by querying the live Neon database for real citizens
 */
async function listPersonas() {
  const personas = [];

  // Query real citizens from Neon PostgreSQL database
  try {
    const neonCitizens = await legacyPool.query(
      'SELECT user_id, first_name, last_name, email, city, gender FROM mmvy_users ORDER BY user_id ASC'
    );

    neonCitizens.rows.forEach((u) => {
      personas.push({
        id: `citizen_${u.user_id.toLowerCase().replace(/-/g, '_')}`,
        name: `${u.first_name} ${u.last_name}`,
        role: 'CITIZEN',
        department: null,
        email: u.email,
        global_id: u.user_id.startsWith('MMVY-') ? `GLOBAL-${u.user_id}` : `GLOBAL-MMVY-${u.user_id}`,
        city: u.city,
        avatar: u.gender === 'Female' ? '👩' : '👨',
        source: 'Neon PostgreSQL (Authoritative MMVY DB)',
      });
    });
  } catch (err) {
    console.warn('Failed to query Neon users for personas:', err.message);
  }

  // Add departmental officers and administrators
  Object.values(FEDERATED_IDENTITIES)
    .filter((p) => p.role !== 'CITIZEN')
    .forEach((officer) => {
      personas.push({
        id: officer.id,
        name: officer.name,
        role: officer.role,
        department: officer.department,
        email: officer.email,
        global_id: officer.global_id,
        avatar: officer.avatar,
        source: 'Government RBAC Directory',
      });
    });

  return personas;
}

module.exports = {
  loginSSO,
  listPersonas,
  getCitizenProfileFromNeon,
  verifyToken: verifyJwt,
};
