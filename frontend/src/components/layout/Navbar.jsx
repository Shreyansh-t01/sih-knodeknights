import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROLES, NAV_BY_ROLE, ROLE_LABELS } from '../../utils/roles';
import { GovEmblem } from '../common/GovEmblem';
import {
  Bell,
  Home,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  ListOrdered,
  FileCode,
  GitCommit,
  Activity,
  GitMerge,
  Cable,
  Fingerprint,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  History,
  KeyRound,
  LogOut,
  UserCheck,
} from 'lucide-react';

const ICON_MAP = {
  Home,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Bell,
  ListOrdered,
  FileCode,
  GitCommit,
  Activity,
  GitMerge,
  Cable,
  Fingerprint,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  History,
};

const NAV_I18N_MAP = {
  citizen_home: 'nav_home',
  citizen_dashboard: 'nav_dashboard',
  citizen_applications: 'nav_applications',
  citizen_consent: 'nav_consent',
  citizen_notifications: 'nav_notifications',
  officer_overview: 'nav_overview',
  officer_queue: 'nav_queue',
  officer_task_detail: 'nav_task_detail',
  officer_workflow: 'nav_workflow',
  deptadmin_overview: 'nav_overview',
  deptadmin_queue: 'nav_queue',
  deptadmin_health: 'nav_health',
  admin_overview: 'nav_overview',
  admin_workflows: 'nav_workflows',
  admin_connectors: 'nav_connectors',
  admin_mdm: 'nav_mdm',
  admin_semantic: 'nav_semantic',
  admin_exceptions: 'nav_exceptions',
  admin_audit: 'nav_audit',
  auditor_overview: 'nav_overview',
  auditor_audit: 'nav_audit',
  auditor_consent: 'nav_consent_history',
  auditor_workflows: 'nav_workflow_history',
};

export function Navbar() {
  const {
    role,
    citizenInfo,
    activeDepartment,
    currentUser,
    globalId,
    openLoginGate,
    logout,
    isAuthenticated,
  } = useAuth();
  const { currentPage, navigate } = useNavigation();
  const { unreadCount } = useNotifications();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  const navItems = NAV_BY_ROLE[role] || [];

  const renderUserBadge = () => {
    const displayName = currentUser?.name || (role === ROLES.CITIZEN ? citizenInfo.name : 'Officer');
    const avatarLetter = displayName.charAt(0) || 'U';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          className="gov-user-chip"
          title={`SSO Identity: ${currentUser?.sub || 'User'} | Role: ${ROLE_LABELS[role] || role}`}
          style={{ cursor: 'pointer' }}
          onClick={openLoginGate}
        >
          <div
            className="gov-user-avatar"
            style={{
              background:
                role === ROLES.CITIZEN
                  ? '#047857'
                  : role === ROLES.MAHASETU_ADMIN
                  ? '#d97706'
                  : role === ROLES.AUDITOR
                  ? '#059669'
                  : '#2563eb',
            }}
          >
            {avatarLetter}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700 }}>{displayName}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
              {role === ROLES.CITIZEN ? (currentUser?.global_id || globalId) : (ROLE_LABELS[role] || role)}
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#10b981', marginLeft: '4px' }}>●</span>
        </div>

        <button
          type="button"
          onClick={openLoginGate}
          title="Switch Unified Identity / Select another persona"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <KeyRound size={12} />
          <span>Switch Unified ID</span>
        </button>
      </div>
    );
  };

  return (
    <header>
      {/* 1. TOP NATIONAL IDENTITY BAR (Cleaned up, no clutter) */}
      <div className="gov-topbar">
        <div className="gov-topbar-inner">
          <div className="gov-topbar-left">
            <span className="gov-flag-icon" />
            <span>{t('gov_india', 'Government of India')}</span>
            <span style={{ color: '#4b5563' }}>|</span>
            <span>Digital Interoperability & Automated Orchestration Gateway</span>
          </div>

          <div className="gov-topbar-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#38bdf8' }}>
              <Shield size={12} />
              <span>Meri Pehchaan SSO & RBAC Active</span>
            </div>

            <div className="lang-selector-group" role="group" aria-label="Language selection">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-btn ${language === l.code ? 'active' : ''}`}
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={language === l.code}
                  title={`Switch to ${l.label}`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIGNATURE BRANDING HEADER (Focused on core project) */}
      <div className="gov-brand-header">
        <div className="gov-brand-header-inner">
          <div
            className="gov-brand-logo-unit"
            onClick={() => {
              if (role === ROLES.CITIZEN) navigate('citizen_dashboard');
              else if (role === ROLES.DEPARTMENT_OFFICER) navigate('officer_overview');
              else if (role === ROLES.DEPARTMENT_ADMIN) navigate('deptadmin_overview');
              else if (role === ROLES.MAHASETU_ADMIN) navigate('admin_overview');
              else if (role === ROLES.AUDITOR) navigate('auditor_overview');
            }}
          >
            <div className="gov-emblem-wrapper">
              <GovEmblem size={44} showText={false} />
            </div>

            <div className="gov-brand-texts">
              <span className="gov-brand-hindi-sub">
                {t('portal_sub', 'डिजिटल इंटरऑपरेबिलिटी और सहमति मंच')}
              </span>
              <div className="gov-brand-main-title">
                mahasetu<span className="domain-dot">.</span><span className="domain-ext">gov.in</span>
              </div>
              <span className="gov-brand-subtitle">
                {t('portal_tagline', 'Federated Interoperability, Consent & Automated Orchestration Hub (SIH26129)')}
              </span>
            </div>
          </div>

          <div className="gov-header-tools">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f8fafc',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SSO Authenticated Subject:</div>
                <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>
                  {currentUser?.name || 'Unauthenticated'}
                </div>
              </div>
              <button
                type="button"
                onClick={openLoginGate}
                style={{
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <KeyRound size={12} />
                <span>{isAuthenticated ? 'Switch ID' : 'Sign In'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIGNATURE PRIMARY NAVIGATION BAR */}
      <nav className="gov-navbar" aria-label="Primary Navigation">
        <div className="gov-navbar-inner">
          <ul className="gov-nav-list">
            {navItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || FileText;
              const isActive = currentPage === item.id;
              const labelKey = NAV_I18N_MAP[item.id];
              const displayLabel = labelKey ? t(labelKey, item.label) : item.label;
              return (
                <li key={item.id} className="gov-nav-item">
                  <button
                    type="button"
                    className={`gov-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <IconComponent size={15} />
                    <span>{displayLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="gov-nav-right">
            {role === ROLES.CITIZEN && (
              <button
                type="button"
                className="gov-bell-btn"
                title="Notifications"
                onClick={() => navigate('citizen_notifications')}
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="gov-bell-badge">{unreadCount}</span>}
              </button>
            )}

            {renderUserBadge()}
          </div>
        </div>
      </nav>
    </header>
  );
}
