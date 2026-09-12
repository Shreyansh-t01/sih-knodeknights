import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ConsentReviewModal } from './ConsentReviewModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDepartmentName, formatTriggerEvent, formatDate } from '../../utils/statusMapper';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldAlert,
  Building,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export function CitizenDashboard() {
  const { globalId, citizenInfo, localDecisions } = useAuth();
  const { navigate } = useNavigation();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  const [pendingApplications, setPendingApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsApi.getCitizenApplications(globalId);
      const apps = data?.applications || [];
      setAllApplications(apps);

      // Filter pending consent based on database status and local decisions
      const pendingList = apps.filter((app) => {
        const local = localDecisions[app.uarn];
        if (local) {
          return local.decision === 'PENDING_CONSENT';
        }
        return app.overall_status === 'PENDING_CONSENT';
      });
      setPendingApplications(pendingList);
    } catch (err) {
      console.error('Fetch citizen applications error:', err);
      setError(err.message || "We couldn't load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, [globalId, localDecisions]);

  const actionRequiredCount = pendingApplications.length;
  const approvedCount = allApplications.filter((app) => {
    const local = localDecisions[app.uarn];
    if (local) {
      return local.decision === 'APPROVED';
    }
    return app.overall_status === 'APPROVED' || app.overall_status === 'PROCESSING';
  }).length;
  const completedCount = allApplications.filter((app) => app.overall_status === 'COMPLETED').length;
  const totalActiveApps = allApplications.filter((app) => app.overall_status !== 'REJECTED').length;

  const handleReviewClick = (app) => {
    setSelectedAppForReview(app);
  };

  const handleDecisionComplete = (uarn, decision) => {
    setPendingApplications((prev) => prev.filter((a) => a.uarn !== uarn));
  };

  return (
    <div>
      {/* Official Citizen Identity Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0b2545 0%, #133b5c 100%)',
          color: '#ffffff',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '5px solid var(--gov-saffron)',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fed7aa',
                padding: '2px 8px',
                borderRadius: '3px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {t('citizen_portal')}
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            {t('good_morning')}, {citizenInfo.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#cbd5e1' }}>
            <span>{t('citizen_id')}: <strong>{citizenInfo.globalId}</strong></span>
            <span>•</span>
            <span>{t('jurisdiction')}: <strong>{citizenInfo.state || 'Maharashtra'}</strong></span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#86efac', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> {t('linked')}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('citizen_consent')}
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            {t('btn_manage_perms')}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('citizen_applications')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <div className="stat-label">{t('stat_active_apps')}</div>
            <div className="stat-value">{totalActiveApps}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: actionRequiredCount > 0 ? '#fcd34d' : 'var(--border-color)' }}>
          <div className="stat-info">
            <div className="stat-label">{t('stat_action_required')}</div>
            <div className="stat-value" style={{ color: actionRequiredCount > 0 ? '#d97706' : 'var(--text-main)' }}>
              {actionRequiredCount}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">{t('stat_completed')}</div>
            <div className="stat-value">{completedCount > 0 ? completedCount : approvedCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('citizen_notifications')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <div className="stat-label">{t('stat_notifications')}</div>
            <div className="stat-value">{unreadCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#faf5ff', color: '#9333ea' }}>
            <Bell size={22} />
          </div>
        </div>
      </div>

      {/* ACTION REQUIRED Primary Section */}
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#ea580c" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('stat_action_required')}
            </h2>
            {actionRequiredCount > 0 && (
              <span className="badge badge-warning">
                {actionRequiredCount} {t('pending_consent_badge')}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchApplicationsData}
            disabled={loading}
            title="Refresh pending applications"
          >
            <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
            <span>{t('refresh')}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card">
            <LoadingSpinner message="Loading your applications..." />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              We couldn't load your applications
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </p>
            <button type="button" className="btn btn-primary" onClick={fetchApplicationsData}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && actionRequiredCount === 0 && (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              {t('caught_up_title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              {t('caught_up_desc')}
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('citizen_applications')}
            >
              {t('view_past_apps')}
            </button>
          </div>
        )}

        {/* Pending Consent Cards */}
        {!loading && !error && actionRequiredCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingApplications.map((app) => {
              const departments = (app.tasks || []).map((t) => formatDepartmentName(t.target_department));
              return (
                <div
                  key={app.uarn}
                  className="card"
                  style={{
                    borderLeft: '4px solid #f58220',
                    textAlign: 'left',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div className="card-header" style={{ background: '#fffbeb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-warning">{t('status_action_required')}</span>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
                        {formatTriggerEvent(app.trigger_event)}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Detected: {formatDate(app.created_at)}
                    </span>
                  </div>

                  <div className="card-body">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          {t('app_id')}
                        </span>
                        <code style={{ fontSize: '12px' }}>{app.uarn}</code>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          {t('trigger_reason')}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          Address information was updated in a connected government system.
                        </span>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          {t('info_involved')}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          Address
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {t('connected_depts_req')} ({app.tasks?.length || 0}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {departments.map((dept, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-color)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: 'var(--text-main)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Building size={12} color="#64748b" />
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer" style={{ background: '#ffffff', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t('no_data_without_consent')}
                    </span>

                    <button
                      type="button"
                      className="btn btn-orange"
                      onClick={() => handleReviewClick(app)}
                    >
                      <span>{t('review_request')}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE GOVERNMENT APPLICATIONS & INTEROPERABILITY PROGRESS */}
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('my_applications', 'My Connected Applications')} ({allApplications.length})
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('citizen_applications')}
          >
            <span>{t('view_all', 'View All Applications')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {allApplications.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No applications currently registered. When you submit applications on government portals (e.g. MMVY), they will stream here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {allApplications.map((app) => {
              const isMmvy = app.uarn.includes('MMVY') || app.trigger_event === 'Scholarship_Application';
              const title = isMmvy ? 'Mukhyamantri Medhavi Vidyarthi Yojana (MMVY)' : formatTriggerEvent(app.trigger_event);

              return (
                <div key={app.uarn} className="card" style={{ padding: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                          {title}
                        </h3>
                        <StatusBadge status={app.overall_status} type="application" overrideRole="CITIZEN" />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Application UARN: <code>{app.uarn}</code> • Registered: {formatDate(app.created_at)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('citizen_application_detail', { uarn: app.uarn })}
                    >
                      <span>Track Details</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Multi-Department Live Status Rail */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Cross-Department Verification Progress ({app.tasks?.length || 0} Departments):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      {(app.tasks || []).map((task) => (
                        <div
                          key={task.task_id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <Building size={14} color="#64748b" />
                            <strong style={{ fontSize: '12.5px' }}>{formatDepartmentName(task.target_department)}</strong>
                          </div>
                          <StatusBadge status={task.status} type="task" overrideRole="CITIZEN" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Services Link Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          textAlign: 'left',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
            Connected Services Registry
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            16 major state & central departments are integrated via MahaSetu.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('citizen_consent')}
        >
          Manage Active Permissions
        </button>
      </div>

      {/* Review Modal */}
      {selectedAppForReview && (
        <ConsentReviewModal
          application={selectedAppForReview}
          onClose={() => setSelectedAppForReview(null)}
          onDecisionSubmitted={handleDecisionComplete}
        />
      )}
    </div>
  );
}
