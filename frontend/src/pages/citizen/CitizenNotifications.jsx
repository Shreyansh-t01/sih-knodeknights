import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigation } from '../../context/NavigationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/statusMapper';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function CitizenNotifications() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const { navigate } = useNavigation();

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Real-time updates regarding your consent requests and application progress.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={markAllAsRead}
          disabled={notifications.every((n) => n.read)}
        >
          <CheckCheck size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {loading ? (
        <div className="card">
          <LoadingSpinner message="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Bell size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No notifications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            You're all caught up with government workflow updates.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: notif.actionRequired ? '4px solid #f58220' : !notif.read ? '4px solid #2563eb' : '1px solid var(--border-color)',
                background: !notif.read ? '#ffffff' : 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: notif.actionRequired ? '#fef3c7' : '#eff6ff',
                    color: notif.actionRequired ? '#d97706' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  {notif.actionRequired ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#2563eb',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {notif.message}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    {formatDate(notif.timestamp)} • Ref: <code>{notif.uarn}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notif.actionRequired ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      markAsRead(notif.id);
                      navigate('citizen_dashboard');
                    }}
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      markAsRead(notif.id);
                      navigate('citizen_application_detail', { uarn: notif.uarn });
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
