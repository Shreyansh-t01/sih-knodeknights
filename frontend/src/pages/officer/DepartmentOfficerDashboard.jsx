import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { departmentApi } from '../../api/adapters/mockAdapters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDepartmentName, formatTriggerEvent, formatDate } from '../../utils/statusMapper';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ListOrdered,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

export function DepartmentOfficerDashboard() {
  const { activeDepartment } = useAuth();
  const { navigate } = useNavigation();

  const [metrics, setMetrics] = useState(null);
  const [recentQueue, setRecentQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const deptName = formatDepartmentName(activeDepartment);

  useEffect(() => {
    const loadDeptData = async () => {
      try {
        setLoading(true);
        const [m, q] = await Promise.all([
          departmentApi.getMetrics(activeDepartment),
          departmentApi.getWorkQueue(activeDepartment),
        ]);
        setMetrics(m);
        setRecentQueue(q.slice(0, 4));
      } catch (err) {
        console.error('Failed to load department dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDeptData();
  }, [activeDepartment]);

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {deptName}
          </h1>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              background: '#eff6ff',
              color: '#2563eb',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
            }}
          >
            Officer Portal
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Department Operations • Inbound inter-departmental workflow tasks and verification requests.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading department metrics..." />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">New Requests</div>
                <div className="stat-value">{metrics?.newRequests || 28}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Inbox size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{metrics?.inProgress || 14}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Clock size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{metrics?.completed || 182}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Failed / Exceptions</div>
                <div className="stat-value" style={{ color: '#dc2626' }}>
                  {metrics?.failed || 2}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#ffe4e6', color: '#dc2626' }}>
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">SLA At Risk</div>
                <div className="stat-value" style={{ color: '#d97706' }}>
                  {metrics?.slaAtRisk || 3}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          {/* Operational Banner */}
          <div
            className="card"
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#059669" />
              <div>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  Department Integration Status: Operational
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  Uptime {metrics?.uptime} • Avg processing time: {metrics?.avgProcessingTime}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('officer_queue')}
            >
              <ListOrdered size={14} />
              <span>Open Work Queue</span>
            </button>
          </div>

          {/* Recent Work Queue Preview */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ListOrdered size={18} color="var(--primary)" />
                <span>Pending Department Tasks</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('officer_queue')}
              >
                <span>View Full Queue</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>UARN</th>
                      <th>Trigger</th>
                      <th>Request Type</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQueue.map((item) => (
                      <tr key={item.uarn}>
                        <td><code>{item.uarn.slice(0, 24)}...</code></td>
                        <td style={{ fontWeight: 600 }}>{item.trigger}</td>
                        <td>{item.request}</td>
                        <td>
                          <StatusBadge status={item.status} type="task" overrideRole="DEPARTMENT_OFFICER" />
                        </td>
                        <td>{formatDate(item.created)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('officer_task_detail', { uarn: item.uarn })}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
