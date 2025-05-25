import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { examService, userService } from '../api';
import StatCard from '../components/dashboard/StatCard';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import FeedbackForm from '../components/common/FeedbackForm';
import toast from 'react-hot-toast';

// New UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LoadingPage, LoadingCardSkeleton } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const stats = [
  {
    name: 'totalStudents',
    icon: UserGroupIcon,
    value: 42,
    trend: 8,
    color: 'blue',
    linkTo: '/students',
  },
  {
    name: 'activeExams',
    icon: AcademicCapIcon,
    value: 3,
    trend: 12,
    color: 'green',
    linkTo: '/exams',
  },
  {
    name: 'completedExams',
    icon: ClipboardDocumentCheckIcon,
    value: 12,
    trend: -5,
    color: 'purple',
    linkTo: '/exams',
  },
];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, getUserName } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch exams from API
      const examsResponse = await examService.getAllExams({ limit: 100 });

      if (examsResponse.success) {
        const exams = examsResponse.data;

        // Process upcoming exams
        const upcoming = getUpcomingExams(exams);
        setUpcomingExams(upcoming);

        // Process recent exams
        const recent = getRecentExams(exams);
        setRecentExams(recent);
      } else {
        setError(examsResponse.message);
        toast.error(examsResponse.message || t('common.errorFetchingData'));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error(t('common.errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Extract upcoming exams from exam list
   * @param {Array} exams - List of exams
   * @returns {Array} Upcoming exams
   */
  const getUpcomingExams = exams => {
    const now = new Date();

    return exams
      .filter(exam => {
        const startTime = new Date(exam.start_time);
        return startTime > now && (exam.status === 'published' || exam.status === 'active');
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 5) // Get next 5 upcoming exams
      .map(exam => {
        const startTime = new Date(exam.start_time);
        return {
          id: exam.id,
          title: exam.title,
          date: startTime.toLocaleDateString(),
          time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: exam.duration_minutes,
          status: exam.status,
        };
      });
  };

  /**
   * Extract recent exams from exam list
   * @param {Array} exams - List of exams
   * @returns {Array} Recent exams
   */
  const getRecentExams = exams => {
    const now = new Date();

    return exams
      .filter(exam => {
        const endTime = new Date(exam.end_time);
        return endTime < now && exam.status === 'completed';
      })
      .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
      .slice(0, 5) // Get last 5 completed exams
      .map(exam => {
        const endTime = new Date(exam.end_time);
        return {
          id: exam.id,
          title: exam.title,
          date: endTime.toLocaleDateString(),
          time: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: exam.duration_minutes,
          // TODO: Replace with actual scores from exam results
          score: Math.floor(Math.random() * 30) + 70, // Temporary random score
          trustScore: (Math.floor(Math.random() * 30) + 70) / 100, // Temporary random trust score
        };
      });
  };

  if (isLoading) {
    return <LoadingPage message={t('loadingDashboard') || 'Loading your dashboard...'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent"
              >
                {t('welcomeBack') || 'Welcome back'}, {getUserName()}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-2 text-gray-600 dark:text-gray-400"
              >
                {t('dashboardSubtitle') || 'Here\'s what\'s happening with your exams today.'}
              </motion.p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Action Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <QuickActionPanel />
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <FeedbackForm />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
            >
              <StatCard
                title={t(stat.name)}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                color={stat.color}
                linkTo={stat.linkTo}
                linkText={t('viewAll')}
                animate={true}
                showSparkles={index === 0}
                gradient={index % 2 === 0}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card variant="glass" shadow="medium" hover="lift" className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  📅 {t('upcomingExams') || 'Upcoming Exams'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRightIcon}
                  iconPosition="right"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => window.location.href = '/exams'}
                >
                  {t('viewAll') || 'View All'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {upcomingExams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('noUpcomingExams') || 'No upcoming exams'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t('noUpcomingExamsDesc') || 'You\'re all caught up! No exams scheduled for now.'}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.location.href = '/exams/create'}
                  >
                    {t('createExam') || 'Create New Exam'}
                  </Button>
                </div>
              ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('title')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('date')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('time')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('duration')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('status')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingExams.map(exam => {
                  // Calculate time until exam
                  const examDate = new Date(exam.date + ' ' + exam.time);
                  const now = new Date();
                  const timeUntil = examDate - now;
                  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));

                  // Determine status and color based on time until exam
                  let statusColor =
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                  let statusText = t('scheduled', { defaultValue: 'Scheduled' });
                  let progressWidth = '25%';

                  if (hoursUntil < 24) {
                    statusColor =
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                    statusText = t('upcoming', { defaultValue: 'Upcoming' });
                    progressWidth = '75%';
                  }

                  if (hoursUntil < 2) {
                    statusColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                    statusText = t('imminent', { defaultValue: 'Imminent' });
                    progressWidth = '90%';
                  }

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {exam.title}
                          </div>
                          {hoursUntil < 48 && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                              {hoursUntil < 1
                                ? t('startsInMinutes', {
                                    minutes: Math.max(1, Math.floor(timeUntil / 60000)),
                                    defaultValue: `Starts in ${Math.max(1, Math.floor(timeUntil / 60000))} minutes`,
                                  })
                                : hoursUntil < 24
                                  ? t('startsInHours', { hours: Math.floor(hoursUntil) })
                                  : t('startsInDays', { days: Math.floor(hoursUntil / 24) })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{exam.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{exam.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exam.duration} {t('minutes')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {statusText}
                          </span>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary-500 h-1.5 rounded-full transition-all duration-1000 ease-in-out animate-pulse"
                              style={{
                                width: progressWidth,
                                animation: hoursUntil < 2 ? 'pulse 1.5s infinite' : 'none',
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/exams/${exam.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-xs font-medium rounded text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-150"
                        >
                          {t('view')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Exams */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('recentExams')}
          </h2>
          <Link
            to="/exams"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/50 text-sm font-medium transition-colors duration-150"
          >
            {t('viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {recentExams.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('noExamsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('title')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('date')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('score')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('trustScore')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentExams.map(exam => {
                  // Determine trust score color and class
                  let trustScoreClass = '';

                  if (exam.trustScore > 0.8) {
                    trustScoreClass =
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                  } else if (exam.trustScore > 0.6) {
                    trustScoreClass =
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                  } else {
                    trustScoreClass =
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                  }

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {exam.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{exam.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {exam.score}%
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${exam.score}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trustScoreClass}`}
                        >
                          {(exam.trustScore * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/exams/${exam.id}/results`}
                          className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-xs font-medium rounded text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-150"
                        >
                          {t('viewResults')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
                </table>
              </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Exams - Enhanced with Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <Card variant="glass" shadow="medium" hover="lift" className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  🏆 {t('recentExams') || 'Recent Exam Results'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRightIcon}
                  iconPosition="right"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => window.location.href = '/exams'}
                >
                  {t('viewAll') || 'View All'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {recentExams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('noRecentExams') || 'No recent exam results'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('noRecentExamsDesc') || 'Complete some exams to see your results here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Recent exams table content would go here */}
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Recent exams table implementation...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
