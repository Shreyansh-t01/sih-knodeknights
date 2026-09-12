import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { NotificationProvider } from './context/NotificationContext';

import { RoleSwitcherBar } from './components/layout/RoleSwitcherBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Citizen Pages
import { CitizenHome } from './pages/citizen/CitizenHome';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { MyApplications } from './pages/citizen/MyApplications';
import { ApplicationDetail } from './pages/citizen/ApplicationDetail';
import { CitizenConsentManagement } from './pages/citizen/CitizenConsentManagement';
import { CitizenNotifications } from './pages/citizen/CitizenNotifications';

// Department Officer & Admin Pages
import { DepartmentOfficerDashboard } from './pages/officer/DepartmentOfficerDashboard';
import { DepartmentWorkQueue } from './pages/officer/DepartmentWorkQueue';
import { DepartmentTaskDetail } from './pages/officer/DepartmentTaskDetail';
import { DepartmentAdminDashboard } from './pages/deptAdmin/DepartmentAdminDashboard';

// MahaSetu Admin Pages
import { MahaSetuAdminDashboard } from './pages/mahaAdmin/MahaSetuAdminDashboard';
import { WorkflowMonitor } from './pages/mahaAdmin/WorkflowMonitor';
import { IdentityMappingPage } from './pages/mahaAdmin/IdentityMappingPage';
import { SemanticMappingTool } from './pages/mahaAdmin/SemanticMappingTool';
import { AuditTrailPage } from './pages/mahaAdmin/AuditTrailPage';

import { AuditorDashboard } from './pages/auditor/AuditorDashboard';
import { LanguageProvider } from './context/LanguageContext';
import { AccessDenied } from './components/common/AccessDenied';
import { UnifiedIdGate } from './components/auth/UnifiedIdGate';
import { ROLES } from './utils/roles';

const PAGE_PERMISSIONS = {
  // Citizen
  citizen_home: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],
  citizen_dashboard: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],
  citizen_applications: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],
  citizen_application_detail: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],
  citizen_consent: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],
  citizen_notifications: [ROLES.CITIZEN, ROLES.MAHASETU_ADMIN],

  // Officer
  officer_overview: [ROLES.DEPARTMENT_OFFICER, ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],
  officer_queue: [ROLES.DEPARTMENT_OFFICER, ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],
  officer_task_detail: [ROLES.DEPARTMENT_OFFICER, ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],
  officer_workflow: [ROLES.DEPARTMENT_OFFICER, ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],

  // Department Admin
  deptadmin_overview: [ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],
  deptadmin_queue: [ROLES.DEPARTMENT_ADMIN, ROLES.MAHASETU_ADMIN],

  // MahaSetu Admin
  admin_overview: [ROLES.MAHASETU_ADMIN],
  admin_workflows: [ROLES.MAHASETU_ADMIN],
  admin_mdm: [ROLES.MAHASETU_ADMIN],
  admin_semantic: [ROLES.MAHASETU_ADMIN],
  admin_audit: [ROLES.MAHASETU_ADMIN],

  // Auditor
  auditor_overview: [ROLES.AUDITOR, ROLES.MAHASETU_ADMIN],
  auditor_audit: [ROLES.AUDITOR, ROLES.MAHASETU_ADMIN],
  auditor_consent: [ROLES.AUDITOR, ROLES.MAHASETU_ADMIN],
  auditor_workflows: [ROLES.AUDITOR, ROLES.MAHASETU_ADMIN],
};

function AppContent() {
  const { role, showLoginGate, closeLoginGate } = useAuth();
  const { currentPage } = useNavigation();

  const renderActivePage = () => {
    // Enforce Route-Level RBAC Guard
    const allowedRoles = PAGE_PERMISSIONS[currentPage];
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <AccessDenied pageId={currentPage} requiredRoles={allowedRoles} />;
    }

    switch (currentPage) {
      // Citizen Routes
      case 'citizen_home':
        return <CitizenHome />;
      case 'citizen_dashboard':
        return <CitizenDashboard />;
      case 'citizen_applications':
        return <MyApplications />;
      case 'citizen_application_detail':
        return <ApplicationDetail />;
      case 'citizen_consent':
        return <CitizenConsentManagement />;
      case 'citizen_notifications':
        return <CitizenNotifications />;

      // Department Officer Routes
      case 'officer_overview':
        return <DepartmentOfficerDashboard />;
      case 'officer_queue':
        return <DepartmentWorkQueue />;
      case 'officer_task_detail':
      case 'officer_workflow':
        return <DepartmentTaskDetail />;

      // Department Admin Routes
      case 'deptadmin_overview':
        return <DepartmentAdminDashboard />;
      case 'deptadmin_queue':
        return <DepartmentWorkQueue />;

      // MahaSetu Admin Routes
      case 'admin_overview':
        return <MahaSetuAdminDashboard />;
      case 'admin_workflows':
        return <WorkflowMonitor />;
      case 'admin_mdm':
        return <IdentityMappingPage />;
      case 'admin_semantic':
        return <SemanticMappingTool />;
      case 'admin_audit':
        return <AuditTrailPage />;

      // Auditor Routes
      case 'auditor_overview':
        return <AuditorDashboard subTab="overview" />;
      case 'auditor_audit':
        return <AuditorDashboard subTab="audit_trail" />;
      case 'auditor_consent':
        return <AuditorDashboard subTab="consent_history" />;
      case 'auditor_workflows':
        return <WorkflowMonitor />;

      default:
        return <CitizenHome />;
    }
  };

  return (
    <div className="app-container">
      {showLoginGate && <UnifiedIdGate onClose={closeLoginGate} />}
      <RoleSwitcherBar />
      <Navbar />
      <main className="main-content">{renderActivePage()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
