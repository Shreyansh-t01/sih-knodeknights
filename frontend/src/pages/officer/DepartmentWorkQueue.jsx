import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { departmentApi } from '../../api/adapters/mockAdapters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDepartmentName, formatDate } from '../../utils/statusMapper';
import {
  ListOrdered,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';

export function DepartmentWorkQueue() {
  const { activeDepartment } = useAuth();
  const { navigate } = useNavigation();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const deptName = formatDepartmentName(activeDepartment);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getWorkQueue(activeDepartment);
      setQueue(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeDepartment]);

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.uarn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.request.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'READY') return item.status === 'READY';
    if (filterStatus === 'WAITING') return item.status === 'WAITING';
    if (filterStatus === 'PROCESSING') return item.status === 'RUNNING';
    if (filterStatus === 'COMPLETED') return item.status === 'SUCCESS';
    if (filterStatus === 'FAILED') return item.status === 'FAILED';
    if (filterStatus === 'CANCELLED') return item.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Department Work Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {deptName} • Inbound tasks queued for execution and verification.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchQueue}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-rotate' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', flex: 1 }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by UARN, trigger, or request..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '380px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="WAITING">Waiting for Consent</option>
            <option value="PROCESSING">Processing (Future)</option>
            <option value="COMPLETED">Completed (Future)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading department work queue..." />
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <ListOrdered size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No tasks found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            No tasks match the active filters or search criteria.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>UARN</th>
                  <th>Trigger Event</th>
                  <th>Request Description</th>
                  <th>Task Status</th>
                  <th>Connector</th>
                  <th>Received</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => (
                  <tr key={item.uarn}>
                    <td>
                      <code>{item.uarn}</code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.trigger}</td>
                    <td>{item.request}</td>
                    <td>
                      <StatusBadge status={item.status} type="task" overrideRole="DEPARTMENT_OFFICER" />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}
                      >
                        {item.connectorType}
                      </span>
                    </td>
                    <td>{formatDate(item.created)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
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
      )}
    </div>
  );
}
