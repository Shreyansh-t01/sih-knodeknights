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
} from 'lucide-react';

export function DepartmentTaskDetail() {
  const { pageParams, navigate } = useNavigation();
  const { activeDepartment } = useAuth();
  const uarn = pageParams.uarn;

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const data = await departmentApi.getTaskDetails(uarn);
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
