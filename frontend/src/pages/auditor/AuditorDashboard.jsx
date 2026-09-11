import React, { useState } from 'react';
import { AuditTrailPage } from '../mahaAdmin/AuditTrailPage';
import {
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  History,
  Search,
  Lock,
  Calendar,
} from 'lucide-react';

export function AuditorDashboard({ subTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(subTab);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Auditor Oversight Portal
          </h1>
          <span className="badge badge-neutral" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
            <Lock size={12} style={{ marginRight: '4px' }} />
            Strict Read-Only Verification
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Statutory compliance audit logs, consent verification records, and immutable event traces.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Audit Overview
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'audit_trail' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit_trail')}
        >
          Audit Trail Logs
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'consent_history' ? 'active' : ''}`}
          onClick={() => setActiveTab('consent_history')}
        >
          Consent Verification History
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Total Recorded Events</div>
                <div className="stat-value">1,420</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileSpreadsheet size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Citizen Consents Verified</div>
                <div className="stat-value" style={{ color: '#059669' }}>412</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Active Departments</div>
                <div className="stat-value">16</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Shield size={22} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
              Statutory Compliance Statement
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              All cross-departmental operations within MahaSetu are cryptographically signed and logged with timestamp, citizen global identifier, source department, and explicit consent decisions. The auditor role maintains independent read-only access with zero administrative mutation capabilities.
            </p>
          </div>

          <AuditTrailPage isAuditor={true} />
        </div>
      ) : activeTab === 'audit_trail' ? (
        <AuditTrailPage isAuditor={true} />
      ) : (
        /* Consent Verification History Tab */
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
            Consent Verification Logs
          </h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>UARN</th>
                  <th>Citizen Global ID</th>
                  <th>Trigger Scope</th>
                  <th>Decision</th>
                  <th>Signoff Hash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10 Sep 2026, 23:04</td>
                  <td><code>UARN-20260910225936810-A20B0870897E4D49</code></td>
                  <td>MAHA-TEST-102</td>
                  <td>Address_Update (16 Departments)</td>
                  <td><span className="badge badge-success">APPROVED</span></td>
                  <td><code>0x7f88a912c0...</code></td>
                </tr>
                <tr>
                  <td>08 Sep 2026, 14:22</td>
                  <td><code>UARN-20260908142000-B552</code></td>
                  <td>MAHA-TEST-102</td>
                  <td>Revenue_Department Sync</td>
                  <td><span className="badge badge-success">APPROVED</span></td>
                  <td><code>0x3a4b91f008...</code></td>
                </tr>
                <tr>
                  <td>07 Sep 2026, 11:10</td>
                  <td><code>UARN-20260907103000-A11B</code></td>
                  <td>MAHA-TEST-102</td>
                  <td>UIDAI Child Enrollment</td>
                  <td><span className="badge badge-danger">REJECTED</span></td>
                  <td><code>0x9920b721e4...</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
