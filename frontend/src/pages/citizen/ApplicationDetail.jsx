import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { applicationsApi } from '../../api/applications';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatTriggerEvent, formatDate, formatDepartmentName } from '../../utils/statusMapper';
import { ConsentReviewModal } from './ConsentReviewModal';
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Copy,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';

export function ApplicationDetail() {
  const { pageParams, navigate } = useNavigation();
  const { globalId, localDecisions } = useAuth();
  const uarn = pageParams.uarn;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        // Check local decisions first
        if (localDecisions[uarn]) {
          const dec = localDecisions[uarn];
          setAppData(
            dec.applicationData || {
              uarn,
              global_id: globalId,
              trigger_event: 'Address_Update',
              overall_status: dec.decision,
              created_at: dec.updatedAt,
              tasks: [
                { task_id: 1, target_department: 'Revenue_Department', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
                { task_id: 2, target_department: 'Municipal_Corporation', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
                { task_id: 3, target_department: 'Transport_Department', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
                { task_id: 4, target_department: 'Police_Department', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
              ],
            }
          );
          setLoading(false);
          return;
        }

        // Otherwise fetch pending
        const data = await applicationsApi.getPendingApplications(globalId);
        const match = (data?.applications || []).find((a) => a.uarn === uarn);
        if (match) {
          setAppData(match);
        } else {
          // Demo fallback
          setAppData({
            uarn: uarn || 'UARN-20260910225936810-A20B0870897E4D49',
            global_id: globalId,
            trigger_event: 'Address_Update',
            overall_status: 'APPROVED',
            created_at: '2026-09-10T22:59:36.812Z',
            tasks: [
              { task_id: 1, target_department: 'UIDAI', status: 'READY' },
              { task_id: 2, target_department: 'Election_Commission', status: 'READY' },
              { task_id: 3, target_department: 'Revenue_Department', status: 'READY' },
              { task_id: 4, target_department: 'Municipal_Corporation', status: 'READY' },
              { task_id: 5, target_department: 'Electricity_Department', status: 'READY' },
              { task_id: 6, target_department: 'Police_Department', status: 'READY' },
            ],
          });
        }
      } catch (err) {
        console.error('Error loading detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [uarn, globalId, localDecisions]);

  const copyUarn = () => {
    if (appData?.uarn) {
      navigator.clipboard.writeText(appData.uarn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner message="Loading application details..." />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Application Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          This application could not be found or has not yet been registered.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('citizen_applications')}>
          Back to Applications
        </button>
      </div>
    );
  }

  const { trigger_event, overall_status, created_at, tasks = [] } = appData;

  return (
    <div style={{ textAlign: 'left' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => navigate('citizen_applications')}
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={14} />
        <span>Back to Applications</span>
      </button>

      {/* Header Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {formatTriggerEvent(trigger_event)}
              </h1>
              <StatusBadge status={overall_status} type="application" overrideRole="CITIZEN" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Application ID:</span>
              <code style={{ fontSize: '13px' }}>{appData.uarn}</code>
              <button
                type="button"
                onClick={copyUarn}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                title="Copy Application ID"
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
              Created on
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatDate(created_at)}</span>
          </div>
        </div>

        {overall_status === 'PENDING_CONSENT' && (
          <div
            className="alert alert-warning"
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div>
              <strong>Action Required:</strong> Please review and give your consent to allow connected departments to proceed.
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowReviewModal(true)}
            >
              Review Request Now
            </button>
          </div>
        )}

        {overall_status === 'APPROVED' && (
          <div className="alert alert-info" style={{ marginTop: '20px' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Consent Approved:</strong> Your consent has been recorded. The connected departments listed below are <strong>ready to proceed</strong> with the workflow.
            </div>
          </div>
        )}

        {overall_status === 'REJECTED' && (
          <div className="alert alert-danger" style={{ marginTop: '20px' }}>
            <XCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Request Rejected:</strong> Cross-department actions for this request have been cancelled.
            </div>
          </div>
        )}
      </div>

      {/* Department Progress Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Building size={18} color="var(--primary)" />
            <span>Department Progress ({tasks.length} connected services)</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target Department</th>
                  <th>Task ID</th>
                  <th>Current State</th>
                  <th>Operational Meaning</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={task.task_id || idx}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={16} color="#64748b" />
                        <span>{formatDepartmentName(task.target_department)}</span>
                      </div>
                    </td>
                    <td><code>#{task.task_id || idx + 1}</code></td>
                    <td>
                      <StatusBadge status={task.status} type="task" overrideRole="CITIZEN" />
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {task.status === 'READY'
                        ? 'Approved & queued for department synchronization'
                        : task.status === 'CANCELLED'
                        ? 'Action cancelled due to citizen rejection'
                        : 'Awaiting citizen approval'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ConsentReviewModal
          application={appData}
          onClose={() => setShowReviewModal(false)}
          onDecisionSubmitted={(u, decision) => {
            setAppData((prev) => ({
              ...prev,
              overall_status: decision,
              tasks: prev.tasks.map((t) => ({
                ...t,
                status: decision === 'APPROVED' ? 'READY' : 'CANCELLED',
              })),
            }));
          }}
        />
      )}
    </div>
  );
}
