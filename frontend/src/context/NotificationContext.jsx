import { createContext, useState, useEffect, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // Initialize notifications from localStorage if available
  const getInitialNotifications = () => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  };

  const [notifications, setNotifications] = useState(getInitialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/notifications');

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
    
    // Save notifications to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'notification') {
          addNotification({
            id: Date.now(),
            type: data.notificationType || 'info',
            message: data.message,
            timestamp: new Date(),
            read: false,
          });
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    }
  }, [lastMessage]);

  // Add a new notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only the latest 50 notifications
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get notifications with pagination
  const getNotifications = (page = 1, limit = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return notifications.slice(start, end);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
