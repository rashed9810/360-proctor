import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRealTimeAnalytics, useRealTimeViolations } from '../../hooks/useRealTimeAnalytics';
import toast from 'react-hot-toast';
import {
  BellIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Real-Time Notifications Component
 * Displays live notifications with beautiful animations and categorization
 */
const RealTimeNotifications = ({ className = '', maxNotifications = 5 }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const { analyticsData, isConnected } = useRealTimeAnalytics({
    autoConnect: true,
    enableNotifications: false, // We'll handle notifications manually
  });

  const { violations, alertCount } = useRealTimeViolations();

  // Process violations into notifications
  useEffect(() => {
    if (violations.length > 0) {
      const latestViolation = violations[0];
      const notification = {
        id: `violation-${latestViolation.id}`,
        type: 'violation',
        severity: latestViolation.severity,
        title: t(`proctoring.violations.${latestViolation.type}`, latestViolation.type),
        message: `Student ${latestViolation.studentId} - Exam ${latestViolation.examId}`,
        timestamp: latestViolation.timestamp,
        icon: ExclamationTriangleIcon,
        color: latestViolation.severity === 'high' ? 'red' : 'yellow',
        action: {
          label: t('common.view', 'View'),
          onClick: () => console.log('View violation:', latestViolation.id),
        },
      };

      addNotification(notification);
    }
  }, [violations, t]);

  // Process analytics updates into notifications
  useEffect(() => {
    if (analyticsData.trustScoreUpdates.length > 0) {
      const latestUpdate = analyticsData.trustScoreUpdates[0];
      if (latestUpdate.score < 60) {
        const notification = {
          id: `trust-score-${latestUpdate.studentId}-${Date.now()}`,
          type: 'trust_score',
          severity: 'warning',
          title: t('analytics.lowTrustScore', 'Low Trust Score Alert'),
          message: `Student ${latestUpdate.studentId}: ${Math.round(latestUpdate.score)}%`,
          timestamp: latestUpdate.timestamp,
          icon: ShieldCheckIcon,
          color: 'orange',
          action: {
            label: t('common.monitor', 'Monitor'),
            onClick: () => console.log('Monitor student:', latestUpdate.studentId),
          },
        };

        addNotification(notification);
      }
    }
  }, [analyticsData.trustScoreUpdates, t]);

  const addNotification = (notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, maxNotifications - 1)];
      setUnreadCount(prev => prev + 1);
      return newNotifications;
    });

    // Auto-remove notification after 10 seconds for non-critical alerts
    if (notification.severity !== 'high') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 10000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon;
    return <IconComponent className="h-5 w-5" />;
  };

  const getNotificationColor = (color, severity) => {
    const colors = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-500',
        text: 'text-red-800 dark:text-red-200',
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-500',
        text: 'text-yellow-800 dark:text-yellow-200',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-500',
        text: 'text-orange-800 dark:text-orange-200',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500',
        text: 'text-blue-800 dark:text-blue-200',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500',
        text: 'text-green-800 dark:text-green-200',
      },
    };

    return colors[color] || colors.blue;
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-4 right-4 z-50 w-96 max-w-sm ${className}`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('notifications.realTimeAlerts', 'Real-Time Alerts')}
            </h3>
            {isConnected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Live</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllNotifications}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t('notifications.clearAll', 'Clear All')}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700 shadow-lg max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notification, index) => {
            const colors = getNotificationColor(notification.color, notification.severity);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${colors.bg} ${colors.border} ${
                  !notification.read ? 'border-l-4' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${colors.icon}`}>
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>

                    {notification.action && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action.onClick();
                        }}
                        className={`mt-2 text-xs font-medium ${colors.icon} hover:underline`}
                      >
                        {notification.action.label}
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('notifications.noAlerts', 'No real-time alerts')}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button to Show/Hide */}
      {!isVisible && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(true)}
          className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        >
          <div className="relative">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};

export default RealTimeNotifications;
