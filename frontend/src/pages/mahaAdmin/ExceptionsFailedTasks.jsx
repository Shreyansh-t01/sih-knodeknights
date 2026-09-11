import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adapters/mockAdapters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/statusMapper';
import {
  AlertTriangle,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

export function ExceptionsFailedTasks() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState(null);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getExceptions();
      setExceptions(data);
    } catch (err) {
      console.error('Failed to load exceptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const handleRetry = async (id, uarn) => {
    try {
      await adminApi.retryException(id);
      setActionAlert(`Retry successfully scheduled for ${uarn}. Task moved to retry queue.`);
      setExceptions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'Retry Scheduled' } : item))
      );
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Exceptions & Failed Tasks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Monitor connector timeouts, payload schema mismatches, and manual resolution queues.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchExceptions}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {actionAlert && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <div>{actionAlert}</div>
        </div>
      )}

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading exception logs..." />
        </div>
      ) : exceptions.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Zero Active Exceptions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            All departmental connector tasks are executing normally.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>UARN</th>
                  <th>Department</th>
                  <th>Connector</th>
                  <th>Failure Reason</th>
                  <th>Attempts</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item) => (
                  <tr key={item.id}>
                    <td><code>{item.uarn}</code></td>
                    <td style={{ fontWeight: 600 }}>{item.department}</td>
                    <td>
                      <span className="badge badge-neutral">{item.connector}</span>
                    </td>
                    <td style={{ color: '#dc2626', fontSize: '13px', maxWidth: '280px' }}>
                      {item.failure}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.attempts}</span> / 3
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Retry Scheduled'
                            ? 'badge-info'
                            : item.status.includes('Review')
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRetry(item.id, item.uarn)}
                          disabled={item.status === 'Retry Scheduled'}
                        >
                          <RotateCcw size={12} />
                          <span>Retry</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => alert(`Exception Diagnostics for ${item.uarn}:\nFailure: ${item.failure}\nConnector: ${item.connector}\nLast Attempt: ${item.lastAttempt}`)}
                        >
                          Details
                        </button>
                      </div>
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
