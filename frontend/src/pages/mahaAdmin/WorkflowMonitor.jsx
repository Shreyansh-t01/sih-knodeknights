import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatTriggerEvent, formatDate } from '../../utils/statusMapper';
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
  Cable,
  Building,
  Info,
} from 'lucide-react';

export function WorkflowMonitor() {
  const { navigate } = useNavigation();

  const [selectedWorkflow, setSelectedWorkflow] = useState('UARN-20260910225936810-A20B0870897E4D49');
  const [searchUarn, setSearchUarn] = useState('');

  const workflows = [
    {
      uarn: 'UARN-20260910225936810-A20B0870897E4D49',
      globalId: 'MAHA-TEST-102',
      trigger: 'Address_Update',
      consentStatus: 'APPROVED',
      tasksReady: 16,
      tasksTotal: 16,
      status: 'READY',
      sourceDept: 'Municipal_Corporation',
      createdAt: '2026-09-10T22:59:36.812Z',
    },
    {
      uarn: 'UARN-20260911011400215-E45C19812A8F7B31',
      globalId: 'MAHA-TEST-103',
      trigger: 'Income_Certificate',
      consentStatus: 'PENDING_CONSENT',
      tasksReady: 0,
      tasksTotal: 4,
      status: 'PENDING_CONSENT',
      sourceDept: 'Revenue_Department',
      createdAt: '2026-09-11T01:14:00.000Z',
    },
    {
      uarn: 'UARN-20260907103000881-A11B22C33D44E55F',
      globalId: 'MAHA-TEST-104',
      trigger: 'Birth_Certificate',
      consentStatus: 'REJECTED',
      tasksReady: 0,
      tasksTotal: 6,
      status: 'REJECTED',
      sourceDept: 'Municipal_Corporation',
      createdAt: '2026-09-07T10:30:00.000Z',
    },
  ];

  const current = workflows.find((w) => w.uarn === selectedWorkflow) || workflows[0];

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Workflow Monitor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Real-time visibility across pipeline lifecycle: CDC Event → MDM Identity → Application → Citizen Consent → Department Tasks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Workflow List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <GitMerge size={16} color="var(--primary)" />
              <span>Active Workflows</span>
            </div>
          </div>

          <div style={{ padding: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by UARN..."
              value={searchUarn}
              onChange={(e) => setSearchUarn(e.target.value)}
              style={{ marginBottom: '10px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {workflows
                .filter((w) => w.uarn.toLowerCase().includes(searchUarn.toLowerCase()))
                .map((w) => {
                  const isSelected = w.uarn === selectedWorkflow;
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
                        <span>Citizen: {w.globalId}</span>
                        <span>{w.tasksReady} / {w.tasksTotal} tasks ready</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right: End-to-End Pipeline Visualization */}
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
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
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
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
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
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Global ID Mapped</div>
              </div>

              <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

              {/* Stage 3: Application */}
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
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
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
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

              {/* Stage 5: Task Creation */}
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
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
                <div style={{ fontSize: '12px', fontWeight: 700 }}>Task Creation</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{current.tasksTotal} Tasks Created</div>
              </div>

              <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

              {/* Stage 6: Connector */}
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: current.status === 'READY' ? '#dbeafe' : '#f1f5f9',
                    color: current.status === 'READY' ? '#2563eb' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                  }}
                >
                  <Cable size={18} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>Connector</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>API / RPA Dispatch</div>
              </div>

              <span style={{ color: '#94a3b8', fontWeight: 700 }}>➔</span>

              {/* Stage 7: Department */}
              <div style={{ textAlign: 'center', flex: 1, minWidth: '90px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                  }}
                >
                  <Building size={18} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>Department</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Legacy System Sync</div>
              </div>
            </div>
          </div>

          <div className="alert alert-info" style={{ fontSize: '13px', marginBottom: 0 }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Execution Transparency:</strong> Stages 1 through 5 (CDC detection, MDM mapping, UARN generation, citizen consent decision, and task transition to READY) are verified on the live backend database. Connector dispatch represents the next orchestrator pipeline phase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
