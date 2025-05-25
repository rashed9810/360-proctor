import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../api';
import toast from 'react-hot-toast';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LoadingPage, LoadingCardSkeleton } from '../../components/ui/Loading';

// Chart Components (you'll need to install recharts)
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
} from 'recharts';

// Icons
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

/**
 * Advanced Analytics Dashboard Component
 * Comprehensive analytics and reporting for exam proctoring
 */
const AdvancedAnalytics = () => {
  const { t } = useTranslation(['analytics', 'common']);
  const { user } = useAuth();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('violations');
  const [filters, setFilters] = useState({
    examType: 'all',
    department: 'all',
    violationType: 'all',
  });

  // Time range options
  const timeRanges = [
    { value: '24h', label: t('analytics.last24Hours') },
    { value: '7d', label: t('analytics.last7Days') },
    { value: '30d', label: t('analytics.last30Days') },
    { value: '90d', label: t('analytics.last90Days') },
    { value: '1y', label: t('analytics.lastYear') },
  ];

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange, filters]);

  /**
   * Fetch analytics data from API
   */
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      const response = await analyticsService.getAdvancedAnalytics({
        timeRange: selectedTimeRange,
        filters,
      });

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        toast.error(response.message || t('common.errorFetchingData'));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(t('common.errorFetchingData'));

      // Set mock data for development
      setAnalyticsData(generateMockAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate mock analytics data for development
   */
  const generateMockAnalyticsData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      overview: {
        totalExams: 156,
        totalStudents: 1247,
        totalViolations: 89,
        averageTrustScore: 0.87,
        trends: {
          exams: 12.5,
          students: 8.3,
          violations: -15.2,
          trustScore: 5.7,
        },
      },
      violationTrends: days.map(date => ({
        date,
        faceNotDetected: Math.floor(Math.random() * 10),
        multipleFaces: Math.floor(Math.random() * 5),
        tabSwitch: Math.floor(Math.random() * 8),
        audioAnomaly: Math.floor(Math.random() * 3),
        screenCapture: Math.floor(Math.random() * 2),
      })),
      trustScoreDistribution: [
        { range: '90-100%', count: 45, percentage: 36 },
        { range: '80-89%', count: 38, percentage: 31 },
        { range: '70-79%', count: 25, percentage: 20 },
        { range: '60-69%', count: 12, percentage: 10 },
        { range: '0-59%', count: 4, percentage: 3 },
      ],
      examPerformance: days.slice(-7).map(date => ({
        date,
        averageScore: 75 + Math.random() * 20,
        trustScore: 0.8 + Math.random() * 0.2,
        completionRate: 0.85 + Math.random() * 0.15,
      })),
      violationTypes: [
        { name: 'Face Not Detected', value: 35, color: chartColors.error },
        { name: 'Multiple Faces', value: 22, color: chartColors.warning },
        { name: 'Tab Switch', value: 18, color: chartColors.purple },
        { name: 'Audio Anomaly', value: 15, color: chartColors.pink },
        { name: 'Screen Capture', value: 10, color: chartColors.primary },
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        exams: Math.floor(Math.random() * 20),
        violations: Math.floor(Math.random() * 10),
      })),
    };
  };

  /**
   * Export analytics data
   */
  const exportData = async format => {
    try {
      const response = await analyticsService.exportAnalytics({
        format,
        timeRange: selectedTimeRange,
        filters,
      });

      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedTimeRange}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(t('analytics.exportSuccess'));
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(t('analytics.exportError'));
    }
  };

  /**
   * Custom tooltip for charts
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingPage message={t('analytics.loadingAnalytics')} />;
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('analytics.noData')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('analytics.noDataDesc')}</p>
          <Button onClick={fetchAnalyticsData}>{t('common.retry')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent">
                📊 {t('analytics.advancedAnalytics')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('analytics.comprehensiveInsights')}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" icon={ArrowDownTrayIcon} onClick={() => exportData('csv')}>
                {t('analytics.exportCSV')}
              </Button>
              <Button variant="outline" icon={ArrowDownTrayIcon} onClick={() => exportData('json')}>
                {t('analytics.exportJSON')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" shadow="medium">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('analytics.timeRange')}
                  </label>
                  <select
                    value={selectedTimeRange}
                    onChange={e => setSelectedTimeRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {timeRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('analytics.examType')}
                  </label>
                  <select
                    value={filters.examType}
                    onChange={e => setFilters(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('analytics.allExamTypes')}</option>
                    <option value="midterm">{t('analytics.midterm')}</option>
                    <option value="final">{t('analytics.final')}</option>
                    <option value="quiz">{t('analytics.quiz')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('analytics.department')}
                  </label>
                  <select
                    value={filters.department}
                    onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('analytics.allDepartments')}</option>
                    <option value="cs">{t('analytics.computerScience')}</option>
                    <option value="math">{t('analytics.mathematics')}</option>
                    <option value="physics">{t('analytics.physics')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('analytics.violationType')}
                  </label>
                  <select
                    value={filters.violationType}
                    onChange={e => setFilters(prev => ({ ...prev, violationType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('analytics.allViolations')}</option>
                    <option value="face">{t('analytics.faceViolations')}</option>
                    <option value="audio">{t('analytics.audioViolations')}</option>
                    <option value="screen">{t('analytics.screenViolations')}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overview Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('analytics.totalExams')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData.overview.totalExams}
                  </p>
                  <div className="flex items-center mt-1">
                    {analyticsData.overview.trends.exams > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.overview.trends.exams > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(analyticsData.overview.trends.exams)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('analytics.totalStudents')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData.overview.totalStudents}
                  </p>
                  <div className="flex items-center mt-1">
                    {analyticsData.overview.trends.students > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.overview.trends.students > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.abs(analyticsData.overview.trends.students)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('analytics.totalViolations')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData.overview.totalViolations}
                  </p>
                  <div className="flex items-center mt-1">
                    {analyticsData.overview.trends.violations > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.overview.trends.violations > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {Math.abs(analyticsData.overview.trends.violations)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('analytics.avgTrustScore')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(analyticsData.overview.averageTrustScore * 100)}%
                  </p>
                  <div className="flex items-center mt-1">
                    {analyticsData.overview.trends.trustScore > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.overview.trends.trustScore > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.abs(analyticsData.overview.trends.trustScore)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Violation Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" shadow="medium">
              <CardHeader>
                <CardTitle>📈 {t('analytics.violationTrends')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.violationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="faceNotDetected"
                      stroke={chartColors.error}
                      strokeWidth={2}
                      name={t('analytics.faceNotDetected')}
                    />
                    <Line
                      type="monotone"
                      dataKey="multipleFaces"
                      stroke={chartColors.warning}
                      strokeWidth={2}
                      name={t('analytics.multipleFaces')}
                    />
                    <Line
                      type="monotone"
                      dataKey="tabSwitch"
                      stroke={chartColors.purple}
                      strokeWidth={2}
                      name={t('analytics.tabSwitch')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Violation Types Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card variant="glass" shadow="medium">
              <CardHeader>
                <CardTitle>🥧 {t('analytics.violationTypes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.violationTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.violationTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Score Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card variant="glass" shadow="medium">
              <CardHeader>
                <CardTitle>📊 {t('analytics.trustScoreDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trustScoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hourly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card variant="glass" shadow="medium">
              <CardHeader>
                <CardTitle>🕐 {t('analytics.hourlyActivity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="exams"
                      stackId="1"
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      name={t('analytics.exams')}
                    />
                    <Area
                      type="monotone"
                      dataKey="violations"
                      stackId="1"
                      stroke={chartColors.error}
                      fill={chartColors.error}
                      name={t('analytics.violations')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Exam Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card variant="glass" shadow="medium">
            <CardHeader>
              <CardTitle>📋 {t('analytics.recentExamPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('analytics.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('analytics.averageScore')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('analytics.trustScore')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('analytics.completionRate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {analyticsData.examPerformance.map((exam, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(exam.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {Math.round(exam.averageScore)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {Math.round(exam.trustScore * 100)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {Math.round(exam.completionRate * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
