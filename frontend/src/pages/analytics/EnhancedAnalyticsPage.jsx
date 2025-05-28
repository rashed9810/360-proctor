import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  WifiIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  BellIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';

// Components
import PageHeader from '../../components/layout/PageHeader';
import InteractiveAnalyticsDashboard from '../../components/analytics/InteractiveAnalyticsDashboard';

/**
 * Enhanced Analytics Page with Real-Time Data
 * Comprehensive analytics dashboard with live updates and beautiful visualizations
 */
const EnhancedAnalyticsPage = () => {
  const { t } = useTranslation();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showSettings, setShowSettings] = useState(false);

  const {
    isConnected,
    connectionStatus,
    analyticsData,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    refreshData,
  } = useRealTimeAnalytics({
    autoConnect: true,
    enableNotifications: true,
    subscriptions: ['analytics', 'violations', 'trustScores', 'systemMetrics'],
  });

  const toggleRealTime = () => {
    if (isRealTimeEnabled) {
      disconnect();
      toast.success(t('analytics.realTimeDisabled', 'Real-time updates disabled'));
    } else {
      connect();
      toast.success(t('analytics.realTimeEnabled', 'Real-time updates enabled'));
    }
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon className="h-4 w-4" />;
      case 'connecting':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <SignalIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <DocumentChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  {t('analytics.enhancedAnalytics', 'Enhanced Analytics')}
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-2"
                  >
                    <SparklesIcon className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'analytics.realTimeInsights',
                    'Real-time insights and comprehensive analytics'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  isConnected
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className={getConnectionStatusColor()}>{getConnectionStatusIcon()}</div>
                <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                  {t(`analytics.status.${connectionStatus}`, connectionStatus)}
                </span>
                {reconnectAttempts > 0 && (
                  <span className="text-xs text-gray-500">({reconnectAttempts} attempts)</span>
                )}
              </motion.div>

              {/* Real-Time Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRealTime}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isRealTimeEnabled
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {isRealTimeEnabled ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isRealTimeEnabled
                    ? t('analytics.pauseRealTime', 'Pause Real-Time')
                    : t('analytics.enableRealTime', 'Enable Real-Time')}
                </span>
              </motion.button>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{t('common.refresh', 'Refresh')}</span>
              </motion.button>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{t('common.settings', 'Settings')}</span>
              </motion.button>
            </div>
          </div>

          {/* Real-Time Data Indicators */}
          {isConnected && analyticsData.lastUpdate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{t('analytics.liveData', 'Live Data')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {t('analytics.lastUpdate', 'Last Update')}:{' '}
                    {analyticsData.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {analyticsData.recentViolations.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      {analyticsData.recentViolations.length}{' '}
                      {t('analytics.recentViolations', 'recent violations')}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400">
                    {analyticsData.overview.activeUsers}{' '}
                    {t('analytics.activeUsers', 'active users')}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('analytics.connectionError', 'Connection Error')}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error.message ||
                    t('analytics.connectionErrorDesc', 'Unable to connect to real-time analytics')}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connect}
                className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
              >
                {t('common.retry', 'Retry')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              {t('analytics.settings', 'Analytics Settings')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.timeRange', 'Time Range')}
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={e => setSelectedTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="1h">{t('analytics.last1Hour', 'Last 1 Hour')}</option>
                  <option value="24h">{t('analytics.last24Hours', 'Last 24 Hours')}</option>
                  <option value="7d">{t('analytics.last7Days', 'Last 7 Days')}</option>
                  <option value="30d">{t('analytics.last30Days', 'Last 30 Days')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.updateInterval', 'Update Interval')}
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                  <option value="1s">{t('analytics.realTime', 'Real-time')}</option>
                  <option value="5s">{t('analytics.every5Seconds', 'Every 5 seconds')}</option>
                  <option value="30s">{t('analytics.every30Seconds', 'Every 30 seconds')}</option>
                  <option value="1m">{t('analytics.everyMinute', 'Every minute')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.notifications', 'Notifications')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('analytics.violationAlerts', 'Violation Alerts')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('analytics.trustScoreAlerts', 'Trust Score Alerts')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <InteractiveAnalyticsDashboard />
      </motion.div>
    </div>
  );
};

export default EnhancedAnalyticsPage;
