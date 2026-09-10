import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  isDark,
  toggleDark,
  onOpenLogin,
  isNavOpen,
  toggleNav,
  onShowToast
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: 'Your document verification is complete.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      text: 'New scholarship scheme added for engineering students.',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      text: 'Reminder: complete bank verification before 30 Sep.',
      time: '3 days ago',
      read: false
    }
  ]);

  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onShowToast('All notifications marked as read', 'success');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <a className="brand" href="#home">
          <span className="brand-logo">
            <span>SP</span>
          </span>
          <span className="brand-text">
            <h1>Scholarship &amp; Student Welfare Portal</h1>
            <p>Empowering students through financial assistance • Government of [State]</p>
          </span>
        </a>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            id="darkToggle"
            aria-label="Toggle dark mode"
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </button>

          <div className="notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="icon-btn"
              id="notifBtn"
              aria-label="Notifications"
              aria-expanded={isNotifOpen}
              onClick={(e) => {
                e.stopPropagation();
                setIsNotifOpen(!isNotifOpen);
              }}
              title="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
              {unreadCount > 0 && <span className="notif-dot"></span>}
            </button>

            <div className={`notification-panel ${isNotifOpen ? 'open' : ''}`} id="notifPanel">
              <div className="notif-head">
                <h4>Notifications</h4>
                {unreadCount > 0 ? (
                  <button type="button" onClick={markAllRead}>
                    Mark all read
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>All read</span>
                )}
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-row ${n.read ? 'read' : ''}`}>
                    <span className="dot"></span>
                    <div>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-navy"
            id="openLogin"
            onClick={onOpenLogin}
          >
            Student Login
          </button>

          <button
            type="button"
            className="hamburger"
            id="hamburgerBtn"
            aria-label="Open menu"
            aria-expanded={isNavOpen}
            onClick={toggleNav}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isNavOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
