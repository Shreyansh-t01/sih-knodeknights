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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsApi.getPendingApplications(globalId);
      // Filter out any locally approved/rejected during current session so UI updates immediately
      const list = (data?.applications || []).filter(
        (app) => !localDecisions[app.uarn]
      );
      setPendingApplications(list);
    } catch (err) {
      console.error('Fetch pending error:', err);
      setError(err.message || "We couldn't load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [globalId, localDecisions]);

  const actionRequiredCount = pendingApplications.length;
  const approvedCount = Object.values(localDecisions).filter(
    (d) => d.decision === 'APPROVED'
  ).length;

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
            <div className="stat-value">{actionRequiredCount + approvedCount + 1}</div>
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
            <div className="stat-value">{approvedCount > 0 ? approvedCount : 2}</div>
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
            onClick={fetchPending}
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
            <button type="button" className="btn btn-primary" onClick={fetchPending}>
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
