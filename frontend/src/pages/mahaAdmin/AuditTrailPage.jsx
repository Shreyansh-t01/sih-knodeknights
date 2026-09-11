import React, { useState, useEffect } from 'react';
import { auditApi } from '../../api/adapters/mockAdapters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/statusMapper';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export const EVENT_LABELS = {
  CDC_EVENT_DETECTED: 'Change detected',
  IDENTITY_MAPPED: 'Citizen identity mapped',
  APPLICATION_CREATED: 'Application created',
  CONSENT_REQUESTED: 'Consent requested',
  CONSENT_APPROVED: 'Consent approved',
  CONSENT_REJECTED: 'Consent rejected',
  TASK_CREATED: 'Department task created',
  TASK_READY: 'Task ready',
  TASK_CANCELLED: 'Task cancelled',
};

export function AuditTrailPage({ isAuditor = false }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uarnFilter, setUarnFilter] = useState('');
  const [globalIdFilter, setGlobalIdFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getAuditLogs({
        uarn: uarnFilter,
        globalId: globalIdFilter,
        event: eventFilter,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isAuditor ? 'Statutory Audit Trail' : 'System Audit Trail'}
            </h1>
            {isAuditor && <span className="badge badge-neutral">Read-Only Oversight</span>}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Immutable event history recording CDC detection, MDM resolution, citizen consent, and task creation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by UARN..."
              value={uarnFilter}
              onChange={(e) => setUarnFilter(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by Citizen ID..."
              value={globalIdFilter}
              onChange={(e) => setGlobalIdFilter(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              {Object.entries(EVENT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({key})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            <Search size={14} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="card">
          <LoadingSpinner message="Querying audit trail logs..." />
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <FileSpreadsheet size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No audit records matched</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Try clearing search filters to display recent platform events.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Name</th>
                  <th>UARN</th>
                  <th>Citizen ID</th>
                  <th>Scope / Dept</th>
                  <th>Actor</th>
                  <th>Action Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const friendlyEvent = EVENT_LABELS[log.event] || log.event;
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>
                          {friendlyEvent}
                        </span>
                      </td>
                      <td><code>{log.uarn ? `${log.uarn.slice(0, 20)}...` : '-'}</code></td>
                      <td><strong>{log.globalId}</strong></td>
                      <td>{log.department}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.actor}</td>
                      <td style={{ fontSize: '13px' }}>{log.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
