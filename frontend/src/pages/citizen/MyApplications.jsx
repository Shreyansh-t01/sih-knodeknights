import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatTriggerEvent, formatDate, formatDepartmentName } from '../../utils/statusMapper';
import { ConsentReviewModal } from './ConsentReviewModal';
import {
  FileText,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

export function MyApplications() {
  const { globalId, localDecisions } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsApi.getPendingApplications(globalId);
      const backendPending = data?.applications || [];

      // Combine with locally approved/rejected decisions so user can track full history
      const localApps = Object.entries(localDecisions).map(([uarn, dec]) => {
        const existing = backendPending.find((b) => b.uarn === uarn);
        if (existing) {
          return {
            ...existing,
            overall_status: dec.decision,
            tasks: (existing.tasks || []).map((t) => ({
              ...t,
              status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED',
            })),
          };
        }
        return (
          dec.applicationData || {
            uarn,
            global_id: globalId,
            trigger_event: 'Address_Update',
            overall_status: dec.decision,
            created_at: dec.updatedAt,
            tasks: [
              { task_id: 1, target_department: 'Revenue_Department', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
              { task_id: 2, target_department: 'Municipal_Corporation', status: dec.decision === 'APPROVED' ? 'READY' : 'CANCELLED' },
            ],
          }
        );
      });

      // Filter out raw pending if they have been decided locally
      const pendingFiltered = backendPending.filter((b) => !localDecisions[b.uarn]);

      // Add a couple of realistic historical completed/in-progress applications for demo completeness
      const historical = [
        {
          uarn: 'UARN-20260814102209-A45F99018B72CD81',
          global_id: globalId,
          trigger_event: 'Income_Certificate_Renewal',
          overall_status: 'APPROVED',
          created_at: '2026-08-14T10:22:09.000Z',
          tasks: [
            { task_id: 1, target_department: 'Revenue_Department', status: 'READY' },
            { task_id: 2, target_department: 'Scholarship_Portal', status: 'READY' },
          ],
        },
        {
          uarn: 'UARN-20260710091522-C88D33129A01EF44',
          global_id: globalId,
          trigger_event: 'Electricity_Connection_Verification',
          overall_status: 'APPROVED',
          created_at: '2026-07-10T09:15:22.000Z',
          tasks: [
            { task_id: 1, target_department: 'Electricity_Department', status: 'READY' },
            { task_id: 2, target_department: 'Municipal_Corporation', status: 'READY' },
          ],
        },
      ];

      setApplications([...pendingFiltered, ...localApps, ...historical]);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [globalId, localDecisions]);

  // Tab filtering logic
  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTION_REQUIRED') return app.overall_status === 'PENDING_CONSENT';
    if (activeTab === 'IN_PROGRESS') return app.overall_status === 'APPROVED';
    if (activeTab === 'COMPLETED') return false; // In current backend, READY means ready to proceed, not yet complete
    if (activeTab === 'REJECTED') return app.overall_status === 'REJECTED';
    return true;
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Track cross-department workflows, pending consent, and progress.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All ({applications.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ACTION_REQUIRED' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTION_REQUIRED')}
        >
          Action Required ({applications.filter((a) => a.overall_status === 'PENDING_CONSENT').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('IN_PROGRESS')}
        >
          Approved / Ready ({applications.filter((a) => a.overall_status === 'APPROVED').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected ({applications.filter((a) => a.overall_status === 'REJECTED').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading applications..." />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={fetchApplications}>
            Try Again
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            No applications in this category
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Applications will appear here as government events or submissions occur.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredApplications.map((app) => (
            <div
              key={app.uarn}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: app.overall_status === 'PENDING_CONSENT' ? '#fff7ed' : '#eff6ff',
                    color: app.overall_status === 'PENDING_CONSENT' ? '#ea580c' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                      {formatTriggerEvent(app.trigger_event)}
                    </span>
                    <StatusBadge status={app.overall_status} type="application" overrideRole="CITIZEN" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <span>Application ID: <code>{app.uarn}</code></span>
                    <span>Created: {formatDate(app.created_at)}</span>
                    <span>Departments: {app.tasks?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {app.overall_status === 'PENDING_CONSENT' ? (
                  <button
                    type="button"
                    className="btn btn-orange btn-sm"
                    onClick={() => setSelectedAppForReview(app)}
                  >
                    <span>Review Request</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('citizen_application_detail', { uarn: app.uarn })}
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppForReview && (
        <ConsentReviewModal
          application={selectedAppForReview}
          onClose={() => setSelectedAppForReview(null)}
          onDecisionSubmitted={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
