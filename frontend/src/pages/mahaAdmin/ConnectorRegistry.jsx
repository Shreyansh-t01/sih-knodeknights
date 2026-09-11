import React, { useState, useEffect } from 'react';
import { connectorApi } from '../../api/adapters/mockAdapters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Cable,
  Server,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Activity,
  Shield,
} from 'lucide-react';

export function ConnectorRegistry() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const data = await connectorApi.getConnectors();
      setConnectors(data);
    } catch (err) {
      console.error('Failed to load connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleTestConnector = async (id, name) => {
    try {
      setTestingId(id);
      setTestResult(null);
      const res = await connectorApi.testConnector(id);
      setTestResult({ id, name, ...res });
      setTimeout(() => setTestResult(null), 4000);
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Connector Registry
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            API First architecture with RPA fallback for legacy systems.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchConnectors}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh Status</span>
        </button>
      </div>

      {testResult && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Ping Successful:</strong> Connector for <strong>{testResult.name}</strong> responded in {testResult.latency} with status {testResult.status}.
          </div>
        </div>
      )}

      {/* Architecture Philosophy Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cable size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>
              Two-Pronged Interoperability Strategy
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>API First</strong> for modern departments • <strong>RPA Automation</strong> for legacy state portals where APIs are unavailable.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          <span className="badge badge-info">5 API Connectors Active</span>
          <span className="badge badge-warning">2 RPA Workers Configured</span>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading connector registry..." />
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Connector Type</th>
                  <th>Status</th>
                  <th>Endpoint / Worker</th>
                  <th>Latency</th>
                  <th>Last Health Check</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.department}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: c.type === 'API Connector' ? '#1d4ed8' : '#92400e',
                          background: c.type === 'API Connector' ? '#eff6ff' : '#fef3c7',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {c.type === 'API Connector' ? <Server size={12} /> : <Cpu size={12} />}
                        {c.type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === 'Healthy'
                            ? 'badge-success'
                            : c.status === 'Configured'
                            ? 'badge-info'
                            : 'badge-danger'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px' }}>{c.endpoint}</code>
                    </td>
                    <td>{c.latency}</td>
                    <td>{c.lastCheck}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleTestConnector(c.id, c.department)}
                        disabled={testingId === c.id}
                      >
                        {testingId === c.id ? 'Pinging...' : 'Test Connection'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
