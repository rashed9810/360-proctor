import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Mock notification data
const mockNotifications = [
  {
    id: 'n1',
    type: 'info',
    title: 'New Student Registered',
    message: 'John Doe has registered for the platform.',
    time: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    link: '/students/1',
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Exam Starting Soon',
    message: 'Mathematics Final Exam starts in 30 minutes.',
    time: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    link: '/exams/2',
  },
  {
    id: 'n3',
    type: 'error',
    title: 'Violation Detected',
    message: 'Multiple faces detected during Physics Exam.',
    time: new Date(Date.now() - 120 * 60000).toISOString(),
    read: false,
    link: '/violations/3',
  },
  {
    id: 'n4',
    type: 'success',
    title: 'Exam Completed',
    message: 'All students have completed the Chemistry Quiz.',
    time: new Date(Date.now() - 240 * 60000).toISOString(),
    read: true,
    link: '/exams/4/results',
  },
  {
    id: 'n5',
    type: 'info',
    title: 'System Update',
    message: 'The system will be updated tonight at 2:00 AM.',
    time: new Date(Date.now() - 480 * 60000).toISOString(),
    read: true,
    link: '/settings',
  },
];

/**
 * Notifications page component
 */
const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    read: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications
  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by type
    if (filter.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filter.type);
    }

    // Filter by read status
    if (filter.read !== 'all') {
      const isRead = filter.read === 'read';
      filtered = filtered.filter(notification => notification.read === isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  // Mark notification as read
  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  // Delete notification
  const deleteNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
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
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  // Get color based on notification type
  const getTypeColor = type => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <BellIcon className="h-7 w-7 mr-2" />
          {t('notifications')}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {t('filter')}
          </button>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {t('markAllAsRead')}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {t('clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('filters')}</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('type')}
              </label>
              <select
                value={filter.type}
                onChange={e => setFilter({ ...filter, type: e.target.value })}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">{t('all')}</option>
                <option value="info">{t('info')}</option>
                <option value="warning">{t('warning')}</option>
                <option value="error">{t('error')}</option>
                <option value="success">{t('success')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('status')}
              </label>
              <select
                value={filter.read}
                onChange={e => setFilter({ ...filter, read: e.target.value })}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">{t('all')}</option>
                <option value="unread">{t('unread')}</option>
                <option value="read">{t('read')}</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilter({ type: 'all', read: 'all' })}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
            >
              {t('resetFilters')}
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              {t('apply')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Notifications list */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('noNotifications')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('noNotificationsDescription')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map(notification => (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(notification.time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {t(notification.type)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          {t('markAsRead')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
