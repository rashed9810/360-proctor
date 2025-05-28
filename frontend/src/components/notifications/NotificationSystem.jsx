import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Mock WebSocket for demonstration purposes
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.readyState = 0; // CONNECTING

    // Simulate connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen({ target: this });
      this.startMockMessages();
    }, 1000);
  }

  send(data) {
    console.log('Mock WebSocket sent:', data);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ target: this });
  }

  startMockMessages() {
    // Sample notifications for demonstration
    const sampleNotifications = [
      {
        id: 'n1',
        type: 'info',
        title: 'New Student Registered',
        message: 'John Doe has registered for the platform.',
        time: new Date().toISOString(),
        read: false,
        link: '/students/1',
      },
      {
        id: 'n2',
        type: 'warning',
        title: 'Exam Starting Soon',
        message: 'Mathematics Final Exam starts in 30 minutes.',
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        link: '/exams/2',
      },
      {
        id: 'n3',
        type: 'error',
        title: 'Violation Detected',
        message: 'Multiple faces detected during Physics Exam.',
        time: new Date(Date.now() - 45 * 60000).toISOString(),
        read: false,
        link: '/violations/3',
      },
      {
        id: 'n4',
        type: 'success',
        title: 'Exam Completed',
        message: 'All students have completed the Chemistry Quiz.',
        time: new Date(Date.now() - 120 * 60000).toISOString(),
        read: true,
        link: '/exams/4/results',
      },
    ];

    // Send initial notifications
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: 'initial',
            notifications: sampleNotifications,
          }),
        });
      }
    }, 1500);

    // Simulate new notifications every 30 seconds
    this.interval = setInterval(() => {
      if (this.readyState === 1 && this.onmessage) {
        const types = ['info', 'warning', 'error', 'success'];
        const type = types[Math.floor(Math.random() * types.length)];
        const titles = {
          info: ['New Student Registered', 'Exam Created', 'Profile Updated'],
          warning: ['Exam Starting Soon', 'Low Participation', 'System Maintenance'],
          error: ['Violation Detected', 'Connection Lost', 'Authentication Failed'],
          success: ['Exam Completed', 'Results Published', 'Account Verified'],
        };
        const title = titles[type][Math.floor(Math.random() * titles[type].length)];

        const notification = {
          id: `n${Date.now()}`,
          type,
          title,
          message: `This is a sample ${type} notification for demonstration.`,
          time: new Date().toISOString(),
          read: false,
          link: '/notifications',
        };

        this.onmessage({
          data: JSON.stringify({
            type: 'new',
            notification,
          }),
        });
      }
    }, 30000);
  }
}

/**
 * Real-time notification system component
 */
const NotificationSystem = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);

  // Connect to WebSocket
  useEffect(() => {
    // In a real app, this would be a real WebSocket connection
    wsRef.current = new MockWebSocket('wss://api.example.com/notifications');

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    wsRef.current.onmessage = event => {
      const data = JSON.parse(event.data);

      if (data.type === 'initial') {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      } else if (data.type === 'new') {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setLatestNotification(data.notification);
        setShowToast(true);

        // Hide toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  // Format relative time
  const formatRelativeTime = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('justNow');
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? t('minuteAgo') : t('minutesAgo')}`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? t('hourAgo') : t('hoursAgo')}`;
    if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? t('dayAgo') : t('daysAgo')}`;
    return date.toLocaleDateString();
  };

  // Get icon based on notification type
  const getNotificationIcon = type => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={t('notifications')}
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="h-6 w-6 animate-pulse" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('notifications')}
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({unreadCount} {t('unread')})
                  </span>
                )}
              </h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <Link
                        to={notification.link}
                        className="flex items-start space-x-3"
                        onClick={() => {
                          markAsRead(notification.id);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatRelativeTime(notification.time)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/notifications"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                onClick={() => setShowDropdown(false)}
              >
                {t('viewAllNotifications')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification for new alerts */}
      <AnimatePresence>
        {showToast && latestNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              className={`h-1 ${
                latestNotification.type === 'info'
                  ? 'bg-blue-500'
                  : latestNotification.type === 'warning'
                    ? 'bg-yellow-500'
                    : latestNotification.type === 'error'
                      ? 'bg-red-500'
                      : 'bg-green-500'
              }`}
            >
              <div className="h-full bg-white dark:bg-gray-800 animate-[shrink_5s_linear]"></div>
            </div>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{getNotificationIcon(latestNotification.type)}</div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {latestNotification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {latestNotification.message}
                  </p>
                  <div className="mt-2 flex space-x-3">
                    <Link
                      to={latestNotification.link}
                      className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      onClick={() => {
                        markAsRead(latestNotification.id);
                        setShowToast(false);
                      }}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {t('view')}
                    </Link>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    onClick={() => setShowToast(false)}
                  >
                    <span className="sr-only">{t('close')}</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
