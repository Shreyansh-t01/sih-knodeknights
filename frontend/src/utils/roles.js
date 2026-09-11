/**
 * MahaSetu Role-Based Access Control (RBAC) & Navigation Config
 */

export const ROLES = {
  CITIZEN: 'CITIZEN',
  DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  MAHASETU_ADMIN: 'MAHASETU_ADMIN',
  AUDITOR: 'AUDITOR',
};

export const ROLE_LABELS = {
  [ROLES.CITIZEN]: 'Citizen',
  [ROLES.DEPARTMENT_OFFICER]: 'Department Officer',
  [ROLES.DEPARTMENT_ADMIN]: 'Department Admin',
  [ROLES.MAHASETU_ADMIN]: 'MahaSetu Admin',
  [ROLES.AUDITOR]: 'Auditor',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.CITIZEN]: 'Review consent requests, track cross-department applications, and manage permissions.',
  [ROLES.DEPARTMENT_OFFICER]: 'Manage departmental work queue, inspect data mappings, and monitor tasks.',
  [ROLES.DEPARTMENT_ADMIN]: 'Monitor department workloads, integration health (API/RPA), and team operations.',
  [ROLES.MAHASETU_ADMIN]: 'Platform control plane for workflows, connectors, MDM identity, and exceptions.',
  [ROLES.AUDITOR]: 'Strict read-only oversight across data workflows, consent actions, and immutable audit logs.',
};

export const NAV_BY_ROLE = {
  [ROLES.CITIZEN]: [
    { id: 'citizen_home', label: 'Home', icon: 'Home' },
    { id: 'citizen_dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'citizen_applications', label: 'My Applications', icon: 'FileText' },
    { id: 'citizen_consent', label: 'Consent', icon: 'ShieldCheck' },
    { id: 'citizen_notifications', label: 'Notifications', icon: 'Bell' },
  ],
  [ROLES.DEPARTMENT_OFFICER]: [
    { id: 'officer_overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'officer_queue', label: 'Work Queue', icon: 'ListOrdered' },
    { id: 'officer_task_detail', label: 'Task Detail', icon: 'FileCode' },
    { id: 'officer_workflow', label: 'Workflow Timeline', icon: 'GitCommit' },
  ],
  [ROLES.DEPARTMENT_ADMIN]: [
    { id: 'deptadmin_overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'deptadmin_queue', label: 'Work Queue', icon: 'ListOrdered' },
    { id: 'deptadmin_health', label: 'Integration Health', icon: 'Activity' },
  ],
  [ROLES.MAHASETU_ADMIN]: [
    { id: 'admin_overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'admin_workflows', label: 'Workflows', icon: 'GitMerge' },
    { id: 'admin_connectors', label: 'Connectors', icon: 'Cable' },
    { id: 'admin_mdm', label: 'Identity Mapping', icon: 'Fingerprint' },
    { id: 'admin_semantic', label: 'Semantic Tool', icon: 'Sparkles' },
    { id: 'admin_exceptions', label: 'Exceptions', icon: 'AlertTriangle' },
    { id: 'admin_audit', label: 'Audit Trail', icon: 'ShieldAlert' },
  ],
  [ROLES.AUDITOR]: [
    { id: 'auditor_overview', label: 'Overview', icon: 'Shield' },
    { id: 'auditor_audit', label: 'Audit Trail', icon: 'FileSpreadsheet' },
    { id: 'auditor_consent', label: 'Consent History', icon: 'CheckCircle2' },
    { id: 'auditor_workflows', label: 'Workflow History', icon: 'History' },
  ],
};

export const DEFAULT_VIEW_BY_ROLE = {
  [ROLES.CITIZEN]: 'citizen_home',
  [ROLES.DEPARTMENT_OFFICER]: 'officer_overview',
  [ROLES.DEPARTMENT_ADMIN]: 'deptadmin_overview',
  [ROLES.MAHASETU_ADMIN]: 'admin_overview',
  [ROLES.AUDITOR]: 'auditor_overview',
};

export const DEPARTMENTS = [
  { code: 'Revenue_Department', name: 'Revenue Department' },
  { code: 'Municipal_Corporation', name: 'Municipal Corporation' },
  { code: 'Transport_Department', name: 'Transport Department' },
  { code: 'Police_Department', name: 'Police Department' },
  { code: 'UIDAI', name: 'UIDAI' },
  { code: 'Election_Commission', name: 'Election Commission' },
  { code: 'Food_Civil_Supplies', name: 'Food & Civil Supplies' },
  { code: 'Scholarship_Portal', name: 'Scholarship Portal' },
  { code: 'Electricity_Department', name: 'Electricity Department' },
  { code: 'Water_Department', name: 'Water Department' },
  { code: 'Income_Tax_Department', name: 'Income Tax Department' },
  { code: 'EPFO', name: 'EPFO' },
  { code: 'ESIC', name: 'ESIC' },
  { code: 'Education_Department', name: 'Education Department' },
  { code: 'Passport_Seva', name: 'Passport Seva' },
];
