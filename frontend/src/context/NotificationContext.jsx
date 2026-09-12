import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsApi } from '../api/adapters/mockAdapters';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load read notification IDs from localStorage
  const getReadIds = () => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mahasetu_read_notifications') : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids) => {
    try {
      localStorage.setItem('mahasetu_read_notifications', JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save read notification IDs', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications();
      const readIds = getReadIds();
      // Apply persisted read states
      const merged = (data || []).map((item) => ({
        ...item,
        read: readIds.includes(item.id) ? true : item.read,
      }));
      setNotifications(merged);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
    await notificationsApi.markAsRead(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      saveReadIds(allIds);
      return prev.map((item) => ({ ...item, read: true }));
    });
    await notificationsApi.markAllAsRead();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
