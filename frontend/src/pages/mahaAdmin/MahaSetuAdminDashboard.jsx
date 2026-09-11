import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { adminApi } from '../../api/adapters/mockAdapters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Layers,
  Network,
  GitMerge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Fingerprint,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Cable,
} from 'lucide-react';

export function MahaSetuAdminDashboard() {
  const { navigate } = useNavigation();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const m = await adminApi.getSystemMetrics();
        setMetrics(m);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            MahaSetu Operations Control Plane
          </h1>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
            }}
          >
            System Administrator
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Platform-wide interoperability, connector registries, MDM identity mapping, and pipeline monitors.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading platform operations telemetry..." />
        </div>
      ) : (
        <>
          {/* Top 6 KPI Summary Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stat-card" onClick={() => navigate('admin_connectors')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <div className="stat-label">Connected Departments</div>
                <div className="stat-value">{metrics?.connectedDepartments || 16}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Network size={20} />
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('admin_workflows')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <div className="stat-label">Active Workflows</div>
                <div className="stat-value">{metrics?.activeWorkflows || 42}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#faf5ff', color: '#9333ea' }}>
                <GitMerge size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Pending Consent</div>
                <div className="stat-value" style={{ color: '#d97706' }}>
                  {metrics?.pendingConsent || 7}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Clock size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Ready Tasks</div>
                <div className="stat-value" style={{ color: '#2563eb' }}>
                  {metrics?.readyTasks || 89}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('admin_exceptions')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <div className="stat-label">Exceptions / Failed</div>
                <div className="stat-value" style={{ color: '#dc2626' }}>
                  {metrics?.failedTasks || 3}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#ffe4e6', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Events Today</div>
                <div className="stat-value">{metrics?.eventsToday || 1420}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Activity size={20} />
              </div>
            </div>
          </div>

          {/* Quick Nav Operational Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
              Operational Management Tools
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => navigate('admin_workflows')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <GitMerge size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Workflow Monitor</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Observe end-to-end event propagation, consent status, and multi-department task readiness.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Open Monitor <ArrowRight size={14} />
                </span>
              </div>

              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => navigate('admin_connectors')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Cable size={20} color="#059669" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Connector Registry</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Manage API First integrations and RPA connectors for legacy departments.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Inspect Connectors <ArrowRight size={14} />
                </span>
              </div>

              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #2563eb' }}
                onClick={() => navigate('admin_mdm')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Fingerprint size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>MDM Identity Mapping</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Map departmental legacy identities to unified citizen Global IDs via live backend MDM API.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Live MDM Tool <ArrowRight size={14} />
                </span>
              </div>

              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #9333ea' }}
                onClick={() => navigate('admin_semantic')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Sparkles size={20} color="#9333ea" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Semantic Intelligence</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Test smart field mapping across government forms using the live semantic engine.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#9333ea', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Analyze Forms <ArrowRight size={14} />
                </span>
              </div>

              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => navigate('admin_exceptions')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Exceptions & Failures</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Inspect timeouts, format mismatches, and manual review triggers.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Exceptions <ArrowRight size={14} />
                </span>
              </div>

              <div
                className="card"
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => navigate('admin_audit')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldAlert size={20} color="#d97706" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Audit Trail</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Full lifecycle event trace from CDC event detection to departmental dispatch.
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Audit Logs <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
