import React, { useState } from 'react';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDepartmentName, formatTriggerEvent, formatDate } from '../../utils/statusMapper';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  FileText,
  Info,
  ExternalLink,
} from 'lucide-react';

export function ConsentReviewModal({ application, onClose, onDecisionSubmitted }) {
  const { recordDecision } = useAuth();
  const { navigate } = useNavigation();
  const { t } = useLanguage();

  const [understood, setUnderstood] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [decisionResult, setDecisionResult] = useState(null); // 'APPROVED' | 'REJECTED'

  if (!application) {
    return null;
  }

  const {
    uarn,
    trigger_event,
    created_at,
    tasks = [],
  } = application;

  const triggerDescription = formatTriggerEvent(trigger_event);

  const getInvolvedInfo = () => {
    if (trigger_event?.toLowerCase().includes('address')) {
      return {
        name: 'Address',
        description: 'Your updated residential/permanent address records.',
      };
    }
    if (trigger_event?.toLowerCase().includes('income')) {
      return {
        name: 'Income Record',
        description: 'Verified annual family income documentation.',
      };
    }
    if (trigger_event?.toLowerCase().includes('caste')) {
      return {
        name: 'Caste Certificate Details',
        description: 'Official social welfare and caste verification certificate data.',
      };
    }
    return {
      name: 'Service Records',
      description: 'Relevant identity and verification records required for this workflow.',
    };
  };

  const involvedInfo = getInvolvedInfo();

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await applicationsApi.submitConsentDecision(uarn, 'APPROVED');
      recordDecision(uarn, 'APPROVED', {
        ...application,
        overall_status: 'APPROVED',
        tasks: tasks.map((t) => ({ ...t, status: 'READY' })),
      });
      setDecisionResult('APPROVED');
      setShowConfirmModal(false);
      if (onDecisionSubmitted) {
        onDecisionSubmitted(uarn, 'APPROVED', res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit consent approval.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this request? Cross-department actions will be cancelled.')) {
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await applicationsApi.submitConsentDecision(uarn, 'REJECTED');
      recordDecision(uarn, 'REJECTED', {
        ...application,
        overall_status: 'REJECTED',
        tasks: tasks.map((t) => ({ ...t, status: 'CANCELLED' })),
      });
      setDecisionResult('REJECTED');
      if (onDecisionSubmitted) {
        onDecisionSubmitted(uarn, 'REJECTED', res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit consent rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE: Approved
  if (decisionResult === 'APPROVED') {
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog" style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div className="modal-body" style={{ padding: '36px 24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {t('approved_title')}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px' }}>
              {t('approved_msg')}
            </p>

            <div
              className="alert alert-info"
              style={{ textAlign: 'left', margin: '0 auto 24px', fontSize: '13px' }}
            >
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>{tasks.length} {t('approved_sub')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (onClose) onClose();
                  navigate('citizen_dashboard');
                }}
              >
                {t('btn_return_dashboard')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (onClose) onClose();
                  navigate('citizen_applications');
                }}
              >
                {t('btn_view_apps')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE: Rejected
  if (decisionResult === 'REJECTED') {
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog" style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div className="modal-body" style={{ padding: '36px 24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ffe4e6',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <XCircle size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {t('rejected_title')}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px' }}>
              {t('rejected_msg')}
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (onClose) onClose();
                navigate('citizen_dashboard');
              }}
            >
              {t('btn_return_dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{t('modal_title')}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t('modal_sub')}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('btn_close')}
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Section 1: Trigger */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {t('why_created')}
            </div>
            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
              }}
            >
              <strong>{triggerDescription}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                Address information was updated in a connected government system.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>{t('app_id')}: <code>{uarn}</code></span>
                <span>Created: {formatDate(created_at)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Information Involved */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {t('info_involved')}
            </div>
            <div
              style={{
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>
                {involvedInfo.name}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                {involvedInfo.description}
              </p>
            </div>
          </div>

          {/* Section 3: Purpose */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {t('purpose')}
            </div>
            <div
              style={{
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                color: 'var(--text-main)',
              }}
            >
              {t('purpose_desc')}
            </div>
          </div>

          {/* Section 4: Departments Involved */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                {t('departments_involved')} ({tasks.length})
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('waiting_for_consent')}
              </span>
            </div>

            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
              }}
            >
              {tasks.map((task, idx) => (
                <div
                  key={task.task_id || idx}
                  style={{
                    padding: '10px 14px',
                    borderBottom: idx < tasks.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#64748b" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatDepartmentName(task.target_department)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Information: {involvedInfo.name} • Purpose: Service synchronization
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {t('status_waiting')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkbox Section */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
            }}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                disabled={isSubmitting}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                {t('checkbox_text')}
              </span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {t('btn_reject')}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!understood || isSubmitting}
            onClick={() => setShowConfirmModal(true)}
          >
            {isSubmitting ? 'Processing...' : t('btn_allow')}
          </button>
        </div>
      </div>

      {/* Confirmation Step Dialog */}
      {showConfirmModal && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 250, background: 'rgba(15, 23, 42, 0.7)' }}
        >
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h4 className="modal-title">{t('confirm_title')}</h4>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                {t('btn_go_back')}
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <ShieldCheck size={28} color="#059669" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t('confirm_text')}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t('confirm_disclaimer')}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: '#f1f5f9',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                <strong>{t('affected_depts')}:</strong> {tasks.length} connected government services
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                {t('btn_go_back')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={isSubmitting}
                style={{ background: '#059669', borderColor: '#047857' }}
              >
                {isSubmitting ? 'Recording Consent...' : t('btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
