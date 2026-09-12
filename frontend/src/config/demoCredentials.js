/**
 * MahaSetu Federated SSO & RBAC Demo Credentials
 * Clean configuration file for test personas, role boundaries, and evaluation.
 */

export const DEMO_CREDENTIALS = {
  citizens: [
    {
      id: 'GLOBAL-MMVY-00010001',
      name: 'Smt. Ananya Deshmukh',
      location: 'Pune',
      role: 'CITIZEN',
      pin: '123456',
      sub: 'demo-citizen-001',
      description: 'Active MMVY applicant with live multi-department consent workflow.',
    },
    {
      id: 'GLOBAL-MMVY-00010002',
      name: 'Shri Rahul Patil',
      location: 'Nashik',
      role: 'CITIZEN',
      pin: '123456',
      sub: 'demo-citizen-002',
      description: 'Higher education scholarship profile with live address in Nashik.',
    },
    {
      id: 'GLOBAL-MMVY-00010003',
      name: 'Kum. Sunita Jadhav',
      location: 'Nagpur',
      role: 'CITIZEN',
      pin: '123456',
      sub: 'demo-citizen-003',
      description: 'Nagpur domicile profile with verified income certificate.',
    },
  ],
  officers: [
    {
      email: 'rajesh.patil@revenue.maharashtra.gov.in',
      name: 'Shri Rajesh Patil',
      role: 'DEPARTMENT_OFFICER',
      department: 'Revenue_Department',
      password: 'MahaSetu@2026',
      sub: 'demo-officer-revenue-001',
      description: 'Scoped strictly to Revenue tasks; blocked from Police tasks.',
    },
    {
      email: 'vikram.shinde@mahapolice.gov.in',
      name: 'Insp. Vikram Shinde',
      role: 'DEPARTMENT_OFFICER',
      department: 'Police_Department',
      password: 'MahaSetu@2026',
      sub: 'demo-officer-police-001',
      description: 'Scoped strictly to Police Department verification queue.',
    },
  ],
  administrators: [
    {
      email: 'neha.sharma@mahasetu.gov.in',
      name: 'Smt. Neha Sharma',
      role: 'MAHASETU_ADMIN',
      department: null,
      password: 'MahaSetu@2026',
      sub: 'demo-admin-001',
      description: 'Full platform administrative privileges (MDM, audit logs, connectors).',
    },
    {
      email: 'amitabh.roy@cag.gov.in',
      name: 'Shri Amitabh Roy',
      role: 'AUDITOR',
      department: null,
      password: 'MahaSetu@2026',
      sub: 'demo-auditor-001',
      description: 'Principal state auditor (read-only oversight across immutable audit logs).',
    },
  ],
};
