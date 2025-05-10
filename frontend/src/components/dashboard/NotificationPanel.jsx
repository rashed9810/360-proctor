import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';

const NotificationPanel = ({ notifications: initialNotifications = [] }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/notifications');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'notification') {
        setNotifications(prev => [
          {
            id: Date.now(),
            type: data.notificationType,
            message: data.message,
            timestamp: new Date(),
            read: false,
          },
          ...prev,
        ]);
      }
    }
  }, [lastMessage]);

  const getNotificationIcon = type => {
    switch (type) {
      case 'violation':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{t('notifications')}</h3>
                <span className="text-sm text-gray-500">
                  {notifications.length} {t('total')}
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 border-b border-gray-100 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mr-2"
                          >
                            {t('markAsRead')}
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">{t('noNotifications')}</div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  {t('clearAll')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
