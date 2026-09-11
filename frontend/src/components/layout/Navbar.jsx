import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROLES, NAV_BY_ROLE } from '../../utils/roles';
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
  Search,
  Zap,
  Play,
  Pause,
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
  const { role, citizenInfo, activeDepartment } = useAuth();
  const { currentPage, navigate } = useNavigation();
  const { unreadCount } = useNotifications();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  const navItems = NAV_BY_ROLE[role] || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === ROLES.CITIZEN) {
      navigate('citizen_applications');
    } else if (role === ROLES.DEPARTMENT_OFFICER || role === ROLES.DEPARTMENT_ADMIN) {
      navigate('officer_queue');
    } else {
      navigate('admin_workflows');
    }
  };

  const renderUserBadge = () => {
    if (role === ROLES.CITIZEN) {
      return (
        <div className="gov-user-chip">
          <div className="gov-user-avatar">{citizenInfo.name.charAt(0)}</div>
          <span>{citizenInfo.name}</span>
        </div>
      );
    }
    if (role === ROLES.DEPARTMENT_OFFICER || role === ROLES.DEPARTMENT_ADMIN) {
      const deptShort = activeDepartment.replace('_Department', '').replace(/_/g, ' ');
      return (
        <div className="gov-user-chip">
          <div className="gov-user-avatar" style={{ background: '#2563eb' }}>
            {deptShort.charAt(0)}
          </div>
          <span>{deptShort} ({role === ROLES.DEPARTMENT_ADMIN ? 'Admin' : 'Officer'})</span>
        </div>
      );
    }
    if (role === ROLES.MAHASETU_ADMIN) {
      return (
        <div className="gov-user-chip">
          <div className="gov-user-avatar" style={{ background: '#d97706' }}>
            A
          </div>
          <span>Operations Admin</span>
        </div>
      );
    }
    if (role === ROLES.AUDITOR) {
      return (
        <div className="gov-user-chip">
          <div className="gov-user-avatar" style={{ background: '#059669' }}>
            AU
          </div>
          <span>Auditor</span>
        </div>
      );
    }
    return null;
  };

  return (
    <header>
      {/* 1. TOP ACCESSIBILITY & NATIONAL IDENTITY BAR */}
      <div className="gov-topbar">
        <div className="gov-topbar-inner">
          <div className="gov-topbar-left">
            <span className="gov-flag-icon" />
            <span>{t('gov_india')}</span>
            <span style={{ color: '#4b5563' }}>|</span>
            <span>{t('gov_india_sub')}</span>
          </div>

          <div className="gov-topbar-right">
            <button
              type="button"
              className="gov-top-link"
              onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
            >
              {t('skip_to_content')}
            </button>
            <span style={{ color: '#4b5563' }}>|</span>
            <button type="button" className="gov-top-link">
              {t('screen_reader')}
            </button>

            <div className="font-resizer-group">
              <button
                type="button"
                className="font-resizer-btn"
                title="Decrease Font Size"
                onClick={() => (document.body.style.fontSize = '13px')}
              >
                A-
              </button>
              <button
                type="button"
                className="font-resizer-btn active"
                title="Normal Font Size"
                onClick={() => (document.body.style.fontSize = '14px')}
              >
                A
              </button>
              <button
                type="button"
                className="font-resizer-btn"
                title="Increase Font Size"
                onClick={() => (document.body.style.fontSize = '15.5px')}
              >
                A+
              </button>
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

      {/* 2. SIGNATURE INDIA.GOV.IN BRANDING & SEARCH HEADER */}
      <div className="gov-brand-header">
        <div className="gov-brand-header-inner">
          <div
            className="gov-brand-logo-unit"
            onClick={() => {
              if (role === ROLES.CITIZEN) navigate('citizen_home');
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
                {t('portal_sub')}
              </span>
              <div className="gov-brand-main-title">
                mahasetu<span className="domain-dot">.</span><span className="domain-ext">gov.in</span>
              </div>
              <span className="gov-brand-subtitle">
                {t('portal_tagline')}
              </span>
            </div>
          </div>

          <div className="gov-header-tools">
            <form className="gov-header-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="gov-header-search-input"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="gov-header-search-btn" title={t('search_btn')}>
                <Search size={16} />
              </button>
            </form>

            <div className="gov-digital-india-badge">
              <div className="gov-di-icon">SIH</div>
              <div className="gov-di-text">
                <div className="gov-di-title">{t('digital_india')}</div>
                <div className="gov-di-sub">{t('power_to_empower')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIGNATURE DEEP NAVY NAVBAR WITH ORANGE ACTIVE TAB */}
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

      {/* 4. CONTINUOUSLY MOVING SPOTLIGHT TICKER (india.gov.in style) */}
      <div className="gov-spotlight-bar" aria-label="Portal Spotlight Ticker">
        <div className="gov-spotlight-badge">
          <Zap size={13} fill="#ffffff" />
          <span>{t('spotlight')}</span>
        </div>

        <div 
          className="gov-spotlight-ticker-viewport"
          title={isTickerPaused ? "Ticker Paused" : "Hover to pause scrolling"}
        >
          <div className={`gov-spotlight-ticker-track ${isTickerPaused ? 'is-paused' : ''}`}>
            {/* Primary Track Sequence */}
            <div className="gov-spotlight-item-set">
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">⚡</span>
                <span>{t('spotlight_text')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">🔒</span>
                <span>{t('spotlight_item2', 'Citizen consent is strictly mandatory prior to any inter-departmental data exchange.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">📋</span>
                <span>{t('spotlight_item3', 'Real-time synchronization active for UIDAI, Mahabhulekh, MahaDBT, and Civil Supplies.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">🚀</span>
                <span>{t('spotlight_item4', 'Track live application status via your Digilocker / MahaSetu Single Window.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
            </div>

            {/* Seamless Duplicate Track for Infinite Smooth Scrolling */}
            <div className="gov-spotlight-item-set" aria-hidden="true">
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">⚡</span>
                <span>{t('spotlight_text')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">🔒</span>
                <span>{t('spotlight_item2', 'Citizen consent is strictly mandatory prior to any inter-departmental data exchange.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">📋</span>
                <span>{t('spotlight_item3', 'Real-time synchronization active for UIDAI, Mahabhulekh, MahaDBT, and Civil Supplies.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
              <span className="gov-spotlight-item">
                <span className="ticker-bullet">🚀</span>
                <span>{t('spotlight_item4', 'Track live application status via your Digilocker / MahaSetu Single Window.')}</span>
              </span>
              <span className="gov-spotlight-sep">✦</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`gov-spotlight-pause-btn ${isTickerPaused ? 'is-paused-btn' : ''}`}
          onClick={() => setIsTickerPaused(!isTickerPaused)}
          title={isTickerPaused ? t('ticker_play', 'Resume Marquee') : t('ticker_pause', 'Pause Marquee')}
          aria-label={isTickerPaused ? "Resume news ticker" : "Pause news ticker"}
        >
          {isTickerPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
        </button>
      </div>
    </header>
  );
}
