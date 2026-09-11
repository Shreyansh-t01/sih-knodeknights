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
import { ConnectorRegistry } from './pages/mahaAdmin/ConnectorRegistry';
import { IdentityMappingPage } from './pages/mahaAdmin/IdentityMappingPage';
import { SemanticMappingTool } from './pages/mahaAdmin/SemanticMappingTool';
import { ExceptionsFailedTasks } from './pages/mahaAdmin/ExceptionsFailedTasks';
import { AuditTrailPage } from './pages/mahaAdmin/AuditTrailPage';

import { AuditorDashboard } from './pages/auditor/AuditorDashboard';
import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  const { currentPage } = useNavigation();

  const renderActivePage = () => {
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
      case 'deptadmin_health':
        return <DepartmentAdminDashboard />;

      // MahaSetu Admin Routes
      case 'admin_overview':
        return <MahaSetuAdminDashboard />;
      case 'admin_workflows':
        return <WorkflowMonitor />;
      case 'admin_connectors':
        return <ConnectorRegistry />;
      case 'admin_mdm':
        return <IdentityMappingPage />;
      case 'admin_semantic':
        return <SemanticMappingTool />;
      case 'admin_exceptions':
        return <ExceptionsFailedTasks />;
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
