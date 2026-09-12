import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { applicationsApi } from '../../api/applications';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatTriggerEvent, formatDate, formatDepartmentName } from '../../utils/statusMapper';
import {
  GitMerge,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Fingerprint,
  FileCheck2,
  ShieldCheck,
  ListOrdered,
  Building,
  Info,
  RefreshCw,
} from 'lucide-react';

export function WorkflowMonitor() {
  const { navigate } = useNavigation();

  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [searchUarn, setSearchUarn] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const apps = await applicationsApi.getAllApplications();
      const mapped = apps.map((app) => {
        const tasks = app.tasks || [];
        const readyCount = tasks.filter((t) => t.status === 'READY' || t.status === 'COMPLETED').length;
        return {
          uarn: app.uarn,
          globalId: app.global_id,
          trigger: app.trigger_event,
          consentStatus: app.overall_status,
          status: app.overall_status === 'APPROVED' ? (readyCount > 0 ? 'READY' : 'APPROVED') : app.overall_status,
          tasksReady: readyCount,
          tasksTotal: tasks.length,
          tasks,
          createdAt: app.created_at,
        };
      });
      setWorkflows(mapped);
      if (mapped.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(mapped[0].uarn);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const current = workflows.find((w) => w.uarn === selectedWorkflow) || workflows[0] || null;

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Workflow Monitor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Real-time cross-department workflow lifecycle: CDC Event → MDM Resolution → UARN Generation → Citizen Consent → Department Tasks.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={loadWorkflows}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Querying live pipeline workflows..." />
        </div>
      ) : workflows.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <GitMerge size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No active workflows detected</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Changes initiated in the citizen portal or source departments will stream here automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Workflow List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <GitMerge size={16} color="var(--primary)" />
                <span>Active Workflows ({workflows.length})</span>
              </div>
            </div>

            <div style={{ padding: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Filter by UARN or Citizen ID..."
                value={searchUarn}
                onChange={(e) => setSearchUarn(e.target.value)}
                style={{ marginBottom: '10px' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
                {workflows
                  .filter((w) =>
                    w.uarn.toLowerCase().includes(searchUarn.toLowerCase()) ||
                    w.globalId.toLowerCase().includes(searchUarn.toLowerCase())
                  )
                  .map((w) => {
                    const isSelected = w.uarn === current?.uarn;
                    return (
                      <div
                        key={w.uarn}
                        onClick={() => setSelectedWorkflow(w.uarn)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>
                            {formatTriggerEvent(w.trigger)}
                          </span>
                          <StatusBadge status={w.status} type="application" overrideRole="MAHASETU_ADMIN" />
                        </div>
                        <code style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                          {w.uarn.slice(0, 26)}...
                        </code>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Citizen: <strong>{w.globalId}</strong></span>
                          <span>{w.tasksReady} / {w.tasksTotal} ready</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right: End-to-End Pipeline Visualization */}
          {current && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pipeline Trace: {formatTriggerEvent(current.trigger)}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    UARN: <code>{current.uarn}</code> • Citizen Global ID: <strong>{current.globalId}</strong>
                  </div>
                </div>
                <StatusBadge status={current.status} type="application" overrideRole="MAHASETU_ADMIN" />
              </div>

              {/* Architecture Visual Diagram */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {/* Stage 1: CDC */}
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#d1fae5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px',
                      }}
                    >
                      <Database size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>CDC Event</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PostgreSQL Listener</div>
                  </div>

                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

                  {/* Stage 2: MDM */}
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#d1fae5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px',
                      }}
                    >
                      <Fingerprint size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>MDM Identity</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Global ID Resolved</div>
                  </div>

                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

                  {/* Stage 3: Application */}
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#d1fae5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px',
                      }}
                    >
                      <FileCheck2 size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Application</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UARN Generated</div>
                  </div>

                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

                  {/* Stage 4: Consent */}
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: current.consentStatus === 'APPROVED' ? '#d1fae5' : current.consentStatus === 'PENDING_CONSENT' ? '#fef3c7' : '#ffe4e6',
                        color: current.consentStatus === 'APPROVED' ? '#059669' : current.consentStatus === 'PENDING_CONSENT' ? '#d97706' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px',
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Consent</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {current.consentStatus === 'APPROVED' ? 'Approved' : current.consentStatus === 'PENDING_CONSENT' ? 'Pending Action' : 'Rejected'}
                    </div>
                  </div>

                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

                  {/* Stage 5: Department Tasks */}
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: current.tasksReady > 0 ? '#dbeafe' : '#f1f5f9',
                        color: current.tasksReady > 0 ? '#2563eb' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px',
                      }}
                    >
                      <ListOrdered size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Task Dispatch</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{current.tasksTotal} Tasks Active</div>
                  </div>
                </div>
              </div>

              {/* Department Tasks Breakdown */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                  Departmental Tasks for {current.uarn}
                </h4>
                {current.tasks.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks linked yet.</p>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Task ID</th>
                          <th>Target Department</th>
                          <th>Status</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {current.tasks.map((task) => (
                          <tr key={task.task_id}>
                            <td><code>#{task.task_id}</code></td>
                            <td><strong>{formatDepartmentName(task.target_department)}</strong></td>
                            <td>
                              <StatusBadge status={task.status} type="task" overrideRole="MAHASETU_ADMIN" />
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {task.updated_at ? formatDate(task.updated_at) : 'Active'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="alert alert-info" style={{ fontSize: '13px', marginBottom: 0 }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Live Pipeline:</strong> All workflows, UARNs, citizen IDs, and departmental tasks shown above are fetched live from the central PostgreSQL database.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
