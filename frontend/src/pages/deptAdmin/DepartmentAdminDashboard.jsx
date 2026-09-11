import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { departmentApi } from '../../api/adapters/mockAdapters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDepartmentName } from '../../utils/statusMapper';
import {
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Inbox,
  Server,
  Cpu,
  BarChart3,
  RefreshCw,
  ListOrdered,
} from 'lucide-react';

export function DepartmentAdminDashboard() {
  const { activeDepartment } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const deptName = formatDepartmentName(activeDepartment);

  useEffect(() => {
    const loadAdminMetrics = async () => {
      try {
        setLoading(true);
        const data = await departmentApi.getMetrics(activeDepartment);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load dept admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminMetrics();
  }, [activeDepartment]);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {deptName}
          </h1>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              background: '#fef3c7',
              color: '#92400e',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #fcd34d',
            }}
          >
            Department Admin
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Operational management, team workload distribution, and connector telemetry.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          Overview & Metrics
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'HEALTH' ? 'active' : ''}`}
          onClick={() => setActiveTab('HEALTH')}
        >
          Integration Health (API / RPA)
        </button>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading department administration data..." />
        </div>
      ) : activeTab === 'OVERVIEW' ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Requests Today</div>
                <div className="stat-value">{metrics?.newRequests || 28}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Inbox size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Pending Consent</div>
                <div className="stat-value">{metrics?.slaAtRisk || 3}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Clock size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Ready for Execution</div>
                <div className="stat-value">{metrics?.inProgress || 14}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#1e40af' }}>
                <Layers size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Completed Today</div>
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
          </div>

          <div
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                Department Work Queue Monitoring
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Review active queue items, assign tasks, and monitor SLA turnaround times.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('officer_queue')}
            >
              <ListOrdered size={16} />
              <span>Go to Work Queue</span>
            </button>
          </div>
        </>
      ) : (
        /* Integration Health Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#059669" />
              <span>Telemetry & Connector Status</span>
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  Department API Link
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>
                  Operational (99.8%)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Last health check 45s ago
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  RPA Worker Node
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>
                  Configured / Idle
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Worker: Playwright-Agent-01
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  Average Latency
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>240 ms</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Within normal SLA bounds
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  Error Rate
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>0.4%</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  2 exceptions in last 24h
                </span>
              </div>
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: '#1e40af',
              }}
            >
              <strong>Architecture Note:</strong> MahaSetu connects to {deptName} via standard REST API endpoints for modern services, with fallback RPA automation configured for legacy departmental screens.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
