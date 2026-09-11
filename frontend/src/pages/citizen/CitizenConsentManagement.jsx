import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { activePermissionsApi } from '../../api/adapters/mockAdapters';
import { applicationsApi } from '../../api/applications';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDepartmentName, formatTriggerEvent, formatDate } from '../../utils/statusMapper';
import {
  ShieldCheck,
  Building,
  Key,
  Clock,
  Calendar,
  Eye,
  Info,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react';

export function CitizenConsentManagement() {
  const { globalId, localDecisions } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState('PERMISSIONS'); // 'PERMISSIONS' | 'REQUESTS'
  const [permissions, setPermissions] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsentData = async () => {
      try {
        setLoading(true);
        const [perms, pendingData] = await Promise.all([
          activePermissionsApi.getPermissions(),
          applicationsApi.getPendingApplications(globalId).catch(() => ({ applications: [] })),
        ]);

        setPermissions(perms);

        // Build list of recent consent requests
        const requests = [];
        // Add pending from API
        (pendingData.applications || []).forEach((app) => {
          if (!localDecisions[app.uarn]) {
            requests.push({
              uarn: app.uarn,
              trigger: app.trigger_event,
              decision: 'PENDING_CONSENT',
              date: app.created_at,
              deptCount: app.tasks?.length || 0,
            });
          }
        });

        // Add locally recorded decisions
        Object.entries(localDecisions).forEach(([uarn, dec]) => {
          requests.push({
            uarn,
            trigger: dec.applicationData?.trigger_event || 'Address_Update',
            decision: dec.decision,
            date: dec.updatedAt,
            deptCount: dec.applicationData?.tasks?.length || 16,
          });
        });

        setRecentDecisions(requests);
      } catch (err) {
        console.error('Failed to load consent data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConsentData();
  }, [globalId, localDecisions]);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          My Consent
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Review active data-sharing permissions and historical consent requests across government systems.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'PERMISSIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PERMISSIONS')}
        >
          Active Permissions ({permissions.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'REQUESTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('REQUESTS')}
        >
          Application Requests ({recentDecisions.length})
        </button>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading consent records..." />
        </div>
      ) : activeTab === 'PERMISSIONS' ? (
        <div>
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <div>
              Active permissions define recurring access rights for statutory verification purposes. You can inspect expiry dates and departmental scopes below.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {permissions.map((perm) => (
              <div key={perm.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{perm.department}</span>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>

                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Shared Data: </span>
                    <strong style={{ color: 'var(--primary)' }}>{perm.data}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Purpose: </span>
                    <span>{perm.purpose}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>Expires: <strong>{perm.expiry}</strong></span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Ref: <code>{perm.uarn}</code>
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`Active Consent Record Details:\nDepartment: ${perm.department}\nData: ${perm.data}\nPurpose: ${perm.purpose}\nValid Until: ${perm.expiry}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentDecisions.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <ShieldCheck size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Consent Decisions Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                When applications ask for your approval, decisions will be archived here.
              </p>
            </div>
          ) : (
            recentDecisions.map((dec, idx) => (
              <div
                key={dec.uarn || idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>{formatTriggerEvent(dec.trigger)}</span>
                    <StatusBadge status={dec.decision} type="application" overrideRole="CITIZEN" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                    <span>Application ID: <code>{dec.uarn}</code></span>
                    <span>Date: {formatDate(dec.date)}</span>
                    <span>Departments: {dec.deptCount}</span>
                  </div>
                </div>

                <div>
                  {dec.decision === 'PENDING_CONSENT' ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('citizen_dashboard')}
                    >
                      Review on Dashboard
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('citizen_application_detail', { uarn: dec.uarn })}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
