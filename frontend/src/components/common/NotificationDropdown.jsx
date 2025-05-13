import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const NotificationDropdown = forwardRef(({ onClose, onMarkAllAsRead, size = 'w-80' }, ref) => {
  const { t } = useTranslation('notifications');
  const { notifications, markAsRead } = useNotifications();

  // Get notification icon based on type
  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'violation':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Format notification timestamp
  const formatTimestamp = timestamp => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5; // hours

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return t('notifications.yesterday');
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 mt-2 ${size} bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {t('notifications.title')}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notifications.length} {t('notifications.total')}
            </span>
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
              title={t('notifications.markAsRead')}
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {t('notifications.markAsRead')}
            </button>
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <BellAlertIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                      title={t('notifications.markAsRead')}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {t('close', { defaultValue: 'Close' })}
        </button>
      </div>
    </motion.div>
  );
});

export default NotificationDropdown;
