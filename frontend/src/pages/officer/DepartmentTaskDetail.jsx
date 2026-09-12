import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { departmentApi } from '../../api/adapters/mockAdapters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDepartmentName, formatDate } from '../../utils/statusMapper';
import {
  ArrowLeft,
  Building,
  FileCode,
  GitCommit,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Activity,
  Check,
  Copy,
  Play,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export function DepartmentTaskDetail() {
  const { pageParams, navigate } = useNavigation();
  const { activeDepartment } = useAuth();
  const uarn = pageParams.uarn;

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [connectorFeedback, setConnectorFeedback] = useState(null);

  const handleUpdateStatus = async (newStatus, executeConnector = false) => {
    if (!taskData?.taskId) return;
    try {
      setUpdating(true);
      setActionError(null);
      setConnectorFeedback(null);
      const res = await departmentApi.updateTaskStatus(taskData.taskId, newStatus, { executeConnector });
      if (res?.data?.connector) {
        setConnectorFeedback(res.data.connector);
      }
      // Reload task data to reflect updated status
      const data = await departmentApi.getTaskDetails(uarn, activeDepartment);
      setTaskData(data);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setActionError(err.response?.data?.error?.message || err.message || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const data = await departmentApi.getTaskDetails(uarn, activeDepartment);
        setTaskData(data);
      } catch (err) {
        console.error('Failed to load task details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [uarn, activeDepartment]);

  const copyUarn = () => {
    if (taskData?.uarn) {
      navigator.clipboard.writeText(taskData.uarn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner message="Loading task details & semantic mappings..." />
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3>Task not found</h3>
        <button type="button" className="btn btn-primary" onClick={() => navigate('officer_queue')}>
          Back to Work Queue
        </button>
      </div>
    );
  }

  const {
    trigger,
    request,
    department,
    status,
    created,
    sourceField = 'Permanent_Address',
    canonicalField = 'ADDRESS',
    connectorType = 'API Connector',
    workflowTimeline = [],
  } = taskData;

  const deptName = formatDepartmentName(department || activeDepartment);

  return (
    <div style={{ textAlign: 'left' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => navigate('officer_queue')}
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={14} />
        <span>Back to Work Queue</span>
      </button>

      {/* Task Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Task Details: {request}
              </h1>
              <StatusBadge status={status} type="task" overrideRole="DEPARTMENT_OFFICER" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>UARN:</span>
              <code>{taskData.uarn}</code>
              <button
                type="button"
                onClick={copyUarn}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                title="Copy UARN"
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
              Target Department
            </span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{deptName}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Trigger Event</span>
            <strong>{trigger}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Connector Method</span>
            <strong>{connectorType}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Received Time</span>
            <strong>{formatDate(created)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Execution Mode</span>
            <strong>Automated Orchestration</strong>
          </div>
        </div>
      </div>

      {/* OFFICER ACTION & EXECUTION SECTION */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Officer Actions & Execution
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Execute or advance the state of this departmental synchronization task.
            </span>
          </div>
          <div>
            <StatusBadge status={status} type="task" overrideRole="DEPARTMENT_OFFICER" />
          </div>
        </div>

        {actionError && (
          <div className="alert alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {connectorFeedback && (
          <div
            style={{
              marginBottom: '16px',
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${connectorFeedback.success ? '#86efac' : '#fca5a5'}`,
              background: connectorFeedback.success ? '#f0fdf4' : '#fef2f2',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {connectorFeedback.success
                  ? <CheckCircle2 size={16} color="#16a34a" />
                  : <XCircle size={16} color="#dc2626" />
                }
                <strong style={{ fontSize: '14px', color: connectorFeedback.success ? '#166534' : '#991b1b' }}>
                  Connector Execution — {connectorFeedback.success ? 'Success' : 'Failed'}
                </strong>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: connectorFeedback.connectorType === 'RPA' ? '#7c3aed' : '#2563eb',
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                }}
              >
                {connectorFeedback.connectorType === 'RPA' ? '🤖 RPA Connector' : '🔗 API Connector'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0 8px' }}>
              {connectorFeedback.message}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
              {connectorFeedback.durationMs != null && (
                <span>⏱ Duration: <strong>{connectorFeedback.durationMs}ms</strong></span>
              )}
              {connectorFeedback.executedAt && (
                <span>🕐 {new Date(connectorFeedback.executedAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        {status === 'READY' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updating}
              onClick={() => handleUpdateStatus('COMPLETED', false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', borderColor: '#16a34a' }}
            >
              <CheckCircle2 size={16} />
              <span>{updating ? 'Verifying...' : 'Verify & Approve Task'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={updating}
              onClick={() => handleUpdateStatus('PROCESSING', false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Play size={16} />
              <span>Mark as In-Progress</span>
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={updating}
              onClick={() => handleUpdateStatus('FAILED', false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <XCircle size={16} />
              <span>Reject Task</span>
            </button>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updating}
              onClick={() => handleUpdateStatus('COMPLETED', false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', borderColor: '#16a34a' }}
            >
              <CheckCircle2 size={16} />
              <span>{updating ? 'Updating...' : 'Mark as Completed'}</span>
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={updating}
              onClick={() => handleUpdateStatus('FAILED', false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <XCircle size={16} />
              <span>{updating ? 'Updating...' : 'Mark as Failed'}</span>
            </button>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '14px', fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>Task completed. Department records have been successfully synchronized.</span>
          </div>
        )}

        {status === 'WAITING' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ca8a04', fontSize: '14px' }}>
            <Clock size={18} />
            <span>Awaiting citizen consent. Execution will unlock once the citizen approves the request.</span>
          </div>
        )}

        {status === 'CANCELLED' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
            <XCircle size={18} />
            <span>Task was cancelled because the citizen rejected the synchronization request.</span>
          </div>
        )}

        {status === 'FAILED' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '14px' }}>
            <AlertTriangle size={18} />
            <span>Task execution failed during departmental synchronization.</span>
          </div>
        )}
      </div>

      {/* TECHNICAL UX SECTION: DATA MAPPING */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="#2563eb" />
            <span>Semantic Data Mapping</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            MahaSetu Common Entity Layer
          </span>
        </div>

        <div className="card-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            MahaSetu automatically understands equivalent information fields across government forms and standardizes them into canonical schema entities.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Source Field
              </span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                <code>{sourceField}</code>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inbound Legacy Payload</span>
            </div>

            <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '18px' }}>
              ➔
            </div>

            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700 }}>
                Canonical Field
              </span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>
                <span className="badge badge-info" style={{ fontSize: '13px', padding: '4px 12px' }}>
                  {canonicalField}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Normalized Common Data Model</span>
            </div>

            <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '18px' }}>
              ➔
            </div>

            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Target Department
              </span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                {deptName}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Schema Verified</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: '#1e40af',
            }}
          >
            <strong>Mapping Summary:</strong> MahaSetu mapped the source field to the canonical <code>{canonicalField}</code> entity for consumption by {deptName}.
          </div>
        </div>
      </div>

      {/* WORKFLOW TIMELINE SECTION */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GitCommit size={18} color="var(--primary)" />
            <span>Workflow Timeline</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Chronological Platform Progression
          </span>
        </div>

        <div className="card-body">
          <div className="timeline-list">
            {workflowTimeline.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className={`timeline-marker ${step.status}`}>
                  {step.status === 'completed' && <Check size={12} />}
                </div>
                <div className="timeline-time">{step.time}</div>
                <div className="timeline-title">{step.label}</div>
                <div className="timeline-desc">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
