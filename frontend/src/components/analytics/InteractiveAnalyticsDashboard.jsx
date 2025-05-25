import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

/**
 * Interactive Analytics Dashboard Component
 * Comprehensive analytics with beautiful charts and real-time data
 */
const InteractiveAnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalExams: 156,
      totalStudents: 1247,
      totalSessions: 2834,
      averageTrustScore: 87.5,
      totalViolations: 234,
      activeUsers: 89,
    },
    trends: {
      exams: 12.5,
      students: 8.3,
      trustScore: -2.1,
      violations: -15.7,
    },
    violationTrends: [
      {
        date: '2024-01-01',
        faceNotDetected: 12,
        multipleFaces: 8,
        tabSwitch: 15,
        phoneDetected: 5,
      },
      {
        date: '2024-01-02',
        faceNotDetected: 8,
        multipleFaces: 12,
        tabSwitch: 10,
        phoneDetected: 7,
      },
      {
        date: '2024-01-03',
        faceNotDetected: 15,
        multipleFaces: 6,
        tabSwitch: 18,
        phoneDetected: 3,
      },
      {
        date: '2024-01-04',
        faceNotDetected: 10,
        multipleFaces: 9,
        tabSwitch: 12,
        phoneDetected: 8,
      },
      { date: '2024-01-05', faceNotDetected: 6, multipleFaces: 14, tabSwitch: 8, phoneDetected: 4 },
      {
        date: '2024-01-06',
        faceNotDetected: 11,
        multipleFaces: 7,
        tabSwitch: 16,
        phoneDetected: 6,
      },
      {
        date: '2024-01-07',
        faceNotDetected: 9,
        multipleFaces: 11,
        tabSwitch: 13,
        phoneDetected: 5,
      },
    ],
    trustScoreDistribution: [
      { range: '90-100%', count: 145, percentage: 45.2 },
      { range: '80-89%', count: 98, percentage: 30.6 },
      { range: '70-79%', count: 52, percentage: 16.2 },
      { range: '60-69%', count: 18, percentage: 5.6 },
      { range: '0-59%', count: 7, percentage: 2.4 },
    ],
    hourlyActivity: [
      { hour: '00:00', exams: 2, violations: 1, students: 5 },
      { hour: '02:00', exams: 1, violations: 0, students: 3 },
      { hour: '04:00', exams: 0, violations: 0, students: 1 },
      { hour: '06:00', exams: 3, violations: 2, students: 8 },
      { hour: '08:00', exams: 15, violations: 8, students: 45 },
      { hour: '10:00', exams: 28, violations: 12, students: 78 },
      { hour: '12:00', exams: 22, violations: 15, students: 65 },
      { hour: '14:00', exams: 35, violations: 18, students: 92 },
      { hour: '16:00', exams: 31, violations: 14, students: 87 },
      { hour: '18:00', exams: 18, violations: 9, students: 54 },
      { hour: '20:00', exams: 12, violations: 6, students: 32 },
      { hour: '22:00', exams: 8, violations: 3, students: 18 },
    ],
    performanceMetrics: [
      { name: 'Completion Rate', value: 94.2, target: 95, status: 'warning' },
      { name: 'Detection Accuracy', value: 97.8, target: 95, status: 'success' },
      { name: 'False Positive Rate', value: 2.1, target: 5, status: 'success' },
      { name: 'Response Time', value: 1.2, target: 2, status: 'success' },
    ],
  });

  const timeRanges = [
    { value: '1d', label: t('analytics.last24Hours', 'Last 24 Hours') },
    { value: '7d', label: t('analytics.last7Days', 'Last 7 Days') },
    { value: '30d', label: t('analytics.last30Days', 'Last 30 Days') },
    { value: '90d', label: t('analytics.last90Days', 'Last 90 Days') },
  ];

  const chartColors = {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradient: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const exportData = format => {
    // Simulate data export
    console.log(`Exporting data in ${format} format`);
  };

  const StatCard = ({ title, value, trend, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300`}
      ></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg mr-3`}>
                <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend !== undefined && (
              <div className="flex items-center">
                {trend > 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {Math.abs(trend)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  vs last period
                </span>
              </div>
            )}
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <SparklesIcon className={`h-4 w-4 text-${color}-400`} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <DocumentChartBarIcon className="h-7 w-7 mr-3 text-blue-600" />
            {t('analytics.advancedAnalytics', 'Advanced Analytics')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('analytics.comprehensiveInsights', 'Comprehensive insights and performance metrics')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh', 'Refresh')}</span>
          </motion.button>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => exportData('csv')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>{t('common.export', 'Export')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title={t('analytics.totalExams', 'Total Exams')}
          value={analyticsData.overview.totalExams}
          trend={analyticsData.trends.exams}
          icon={AcademicCapIcon}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title={t('analytics.totalStudents', 'Total Students')}
          value={analyticsData.overview.totalStudents}
          trend={analyticsData.trends.students}
          icon={UserGroupIcon}
          color="green"
          delay={0.2}
        />
        <StatCard
          title={t('analytics.totalSessions', 'Total Sessions')}
          value={analyticsData.overview.totalSessions}
          trend={8.7}
          icon={ClockIcon}
          color="purple"
          delay={0.3}
        />
        <StatCard
          title={t('analytics.averageTrustScore', 'Avg Trust Score')}
          value={`${analyticsData.overview.averageTrustScore}%`}
          trend={analyticsData.trends.trustScore}
          icon={ShieldCheckIcon}
          color="indigo"
          delay={0.4}
        />
        <StatCard
          title={t('analytics.totalViolations', 'Total Violations')}
          value={analyticsData.overview.totalViolations}
          trend={analyticsData.trends.violations}
          icon={ExclamationTriangleIcon}
          color="red"
          delay={0.5}
        />
        <StatCard
          title={t('analytics.activeUsers', 'Active Users')}
          value={analyticsData.overview.activeUsers}
          trend={5.2}
          icon={EyeIcon}
          color="yellow"
          delay={0.6}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                {t('analytics.violationTrends', 'Violation Trends')}
              </h3>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ChartBarIcon className="h-5 w-5 text-red-400" />
              </motion.div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.violationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="faceNotDetected"
                  stroke={chartColors.error}
                  strokeWidth={2}
                  name="Face Not Detected"
                  dot={{ fill: chartColors.error, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="multipleFaces"
                  stroke={chartColors.warning}
                  strokeWidth={2}
                  name="Multiple Faces"
                  dot={{ fill: chartColors.warning, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tabSwitch"
                  stroke={chartColors.info}
                  strokeWidth={2}
                  name="Tab Switch"
                  dot={{ fill: chartColors.info, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="phoneDetected"
                  stroke={chartColors.secondary}
                  strokeWidth={2}
                  name="Phone Detected"
                  dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Trust Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                {t('analytics.trustScoreDistribution', 'Trust Score Distribution')}
              </h3>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrophyIcon className="h-5 w-5 text-blue-400" />
              </motion.div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.trustScoreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                >
                  {analyticsData.trustScoreDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors.gradient[index % chartColors.gradient.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hourly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-green-500" />
                {t('analytics.hourlyActivity', 'Hourly Activity')}
              </h3>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <CalendarIcon className="h-5 w-5 text-green-400" />
              </motion.div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="exams"
                  stackId="1"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.6}
                  name="Exams"
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="2"
                  stroke={chartColors.success}
                  fill={chartColors.success}
                  fillOpacity={0.6}
                  name="Students"
                />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stackId="3"
                  stroke={chartColors.error}
                  fill={chartColors.error}
                  fillOpacity={0.6}
                  name="Violations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2 text-purple-500" />
                {t('analytics.performanceMetrics', 'Performance Metrics')}
              </h3>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <SparklesIcon className="h-5 w-5 text-purple-400" />
              </motion.div>
            </div>
            <div className="space-y-4">
              {analyticsData.performanceMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {metric.name}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          metric.status === 'success'
                            ? 'text-green-600'
                            : metric.status === 'warning'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {metric.value}
                        {metric.name.includes('Rate')
                          ? '%'
                          : metric.name.includes('Time')
                            ? 's'
                            : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(metric.value / metric.target) * 100}%` }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                        className={`h-2 rounded-full ${
                          metric.status === 'success'
                            ? 'bg-green-500'
                            : metric.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>
                        Target: {metric.target}
                        {metric.name.includes('Rate')
                          ? '%'
                          : metric.name.includes('Time')
                            ? 's'
                            : ''}
                      </span>
                      <span>{Math.round((metric.value / metric.target) * 100)}% of target</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveAnalyticsDashboard;
