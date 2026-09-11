import React, { useState } from 'react';
import { mdmApi } from '../../api/mdm';
import { DEPARTMENTS } from '../../utils/roles';
import {
  Fingerprint,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Plus,
  RefreshCw,
} from 'lucide-react';

export function IdentityMappingPage() {
  const [departmentName, setDepartmentName] = useState('dept_1');
  const [legacyId, setLegacyId] = useState('102');
  const [globalId, setGlobalId] = useState('MAHA-TEST-102');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [recentMappings, setRecentMappings] = useState([
    { mapping_id: 1, department_name: 'dept_1', legacy_id: '102', global_id: 'MAHA-TEST-102', created_at: 'Just now' },
    { mapping_id: 2, department_name: 'Municipal_Corporation', legacy_id: 'MC-4019', global_id: 'MAHA-TEST-102', created_at: 'Yesterday' },
    { mapping_id: 3, department_name: 'Transport_Department', legacy_id: 'MH-02-DL901', global_id: 'MAHA-TEST-103', created_at: '2 days ago' },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const result = await mdmApi.createIdentityMapping({
        department_name: departmentName,
        legacy_id: legacyId,
        global_id: globalId,
      });

      setSuccessMsg('Identity mapping saved.');
      if (result) {
        setRecentMappings((prev) => [
          {
            mapping_id: result.mapping_id || Date.now(),
            department_name: result.department_name || departmentName,
            legacy_id: result.legacy_id || legacyId,
            global_id: result.global_id || globalId,
            created_at: 'Just now',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('MDM mapping error:', err);
      setErrorMsg(err.message || 'Failed to save identity mapping.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Master Data Management (MDM) Identity Mapping
          </h1>
          <span className="badge badge-info">Admin / Integration</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Maps fragmented departmental legacy identifiers to a single unified citizen Global ID across state databases.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: '24px', alignItems: 'start' }}>
        {/* Mapping Creation Form */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Fingerprint size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Create / Update Mapping</h3>
          </div>

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div><strong>Success:</strong> {successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Department Identifier / Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. dept_1, Revenue_Department, UIDAI"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Department namespace (e.g. <code>dept_1</code>, letters, numbers, underscores)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Legacy Departmental ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 102, MH-CIT-8821"
                value={legacyId}
                onChange={(e) => setLegacyId(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Local primary key or account number in the source departmental database
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Unified Citizen Global ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MAHA-TEST-102"
                value={globalId}
                onChange={(e) => setGlobalId(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Canonical citizen reference identifier across the interoperability platform
              </span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <strong>Mapping Rule:</strong> (<code>{departmentName || 'dept'}</code>, <code>{legacyId || 'id'}</code>) ➔ <strong>{globalId || 'GLOBAL-ID'}</strong>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Saving to MDM Store...' : 'Create / Update Mapping'}
            </button>
          </form>
        </div>

        {/* Existing / Recent Mappings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Database size={16} color="var(--primary)" />
              <span>Registered Identity Mappings</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Live Store
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Legacy ID</th>
                    <th>Global ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMappings.map((m, idx) => (
                    <tr key={m.mapping_id || idx}>
                      <td style={{ fontWeight: 600 }}>{m.department_name}</td>
                      <td><code>{m.legacy_id}</code></td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{m.global_id}</strong>
                      </td>
                      <td>
                        <span className="badge badge-success">Mapped</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
