import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { examService } from '../../api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  BookOpenIcon,
  StarIcon,
  ArrowRightIcon,
  EyeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../../components/layout/PageHeader';

/**
 * Student Dashboard Component
 * Dedicated interface for students with exam-focused features
 */
const StudentDashboard = () => {
  const { t } = useTranslation(['student', 'common', 'exams']);
  const { user, getUserName } = useAuth();

  // State management
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [studentStats, setStudentStats] = useState({
    totalExams: 0,
    completedExams: 0,
    upcomingExams: 0,
    averageScore: 0,
    averageTrustScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  /**
   * Fetch student dashboard data
   */
  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch available exams for student
      const examsResponse = await examService.getAllExams({ limit: 100 });

      if (examsResponse.success) {
        const exams = examsResponse.data;

        // Process upcoming exams
        const upcoming = getUpcomingExams(exams);
        setUpcomingExams(upcoming);

        // Process recent exams (completed)
        const recent = getRecentExams(exams);
        setRecentExams(recent);

        // Calculate student statistics
        const stats = calculateStudentStats(exams);
        setStudentStats(stats);
      } else {
        setError(examsResponse.message);
        toast.error(examsResponse.message || t('common.errorFetchingData'));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load dashboard data');
      toast.error(t('common.errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get upcoming exams for student
   */
  const getUpcomingExams = exams => {
    const now = new Date();

    return exams
      .filter(exam => {
        const startTime = new Date(exam.start_time);
        return startTime > now && (exam.status === 'published' || exam.status === 'active');
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 5)
      .map(exam => {
        const startTime = new Date(exam.start_time);
        const timeUntilExam = startTime - now;
        const daysUntil = Math.ceil(timeUntilExam / (1000 * 60 * 60 * 24));

        return {
          id: exam.id,
          title: exam.title,
          startTime: startTime,
          duration: exam.duration_minutes,
          daysUntil,
          canStart: timeUntilExam <= 30 * 60 * 1000, // Can start 30 minutes before
        };
      });
  };

  /**
   * Get recent completed exams
   */
  const getRecentExams = exams => {
    const now = new Date();

    return exams
      .filter(exam => {
        const endTime = new Date(exam.end_time);
        return endTime < now && exam.status === 'completed';
      })
      .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
      .slice(0, 5)
      .map(exam => ({
        id: exam.id,
        title: exam.title,
        completedAt: new Date(exam.end_time),
        // TODO: Replace with actual student results
        score: Math.floor(Math.random() * 30) + 70, // Temporary
        trustScore: (Math.floor(Math.random() * 30) + 70) / 100, // Temporary
      }));
  };

  /**
   * Calculate student statistics
   */
  const calculateStudentStats = exams => {
    const now = new Date();
    const totalExams = exams.length;
    const completedExams = exams.filter(
      exam => new Date(exam.end_time) < now && exam.status === 'completed'
    ).length;
    const upcomingExams = exams.filter(
      exam =>
        new Date(exam.start_time) > now && (exam.status === 'published' || exam.status === 'active')
    ).length;

    // TODO: Calculate from actual student results
    const averageScore = 85; // Temporary
    const averageTrustScore = 0.92; // Temporary

    return {
      totalExams,
      completedExams,
      upcomingExams,
      averageScore,
      averageTrustScore,
    };
  };

  /**
   * Format time until exam
   */
  const formatTimeUntilExam = startTime => {
    const now = new Date();
    const timeUntil = startTime - now;

    if (timeUntil <= 0) return t('student.examStarted', 'Exam Started');

    const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return t('student.daysUntil', '{{days}} days', { days });
    if (hours > 0) return t('student.hoursUntil', '{{hours}}h {{minutes}}m', { hours, minutes });
    return t('student.minutesUntil', '{{minutes}} minutes', { minutes });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <PageHeader
            title={t('student.welcomeBack', 'Welcome back, {{name}}!', { name: getUserName() })}
            subtitle={t('student.dashboardSubtitle', 'Track your exams, scores, and progress')}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={fetchStudentData}
                className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Exams Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <SparklesIcon className="h-4 w-4 text-blue-400 ml-2 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('student.totalExams', 'Total Exams')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {studentStats.totalExams}
                  </p>
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                    <ArrowRightIcon className="h-3 w-3 mr-1" />
                    {t('student.allTime', 'All time')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Completed Exams Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <StarIcon className="h-4 w-4 text-green-400 ml-2" />
                    </motion.div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('student.completedExams', 'Completed')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {studentStats.completedExams}
                  </p>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    {t('student.finished', 'Finished')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AcademicCapIcon className="h-4 w-4 text-yellow-400 ml-2" />
                    </motion.div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('student.averageScore', 'Average Score')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {studentStats.averageScore}%
                  </p>
                  <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                    <TrophyIcon className="h-3 w-3 mr-1" />
                    {studentStats.averageScore >= 80
                      ? t('student.excellent', 'Excellent')
                      : studentStats.averageScore >= 70
                        ? t('student.good', 'Good')
                        : t('student.needsImprovement', 'Needs improvement')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChartBarIcon className="h-4 w-4 text-purple-400 ml-2" />
                    </motion.div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('student.trustScore', 'Trust Score')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {Math.round(studentStats.averageTrustScore * 100)}%
                  </p>
                  <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    {studentStats.averageTrustScore >= 0.9
                      ? t('student.highTrust', 'High trust')
                      : studentStats.averageTrustScore >= 0.7
                        ? t('student.goodTrust', 'Good trust')
                        : t('student.lowTrust', 'Needs attention')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Upcoming Exams */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <CalendarDaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('student.upcomingExams', 'Upcoming Exams')}
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <SparklesIcon className="h-5 w-5 text-blue-400" />
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                {upcomingExams.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t('student.noUpcomingExams', 'No upcoming exams scheduled')}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      {t('student.checkBackLater', 'Check back later for new exams')}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {upcomingExams.map((exam, index) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        className="relative group/exam"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-0 group-hover/exam:opacity-30 transition duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {exam.title}
                              </h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {exam.startTime.toLocaleDateString()} at{' '}
                              {exam.startTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="flex items-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              </motion.div>
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatTimeUntilExam(exam.startTime)}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4">
                            {exam.canStart ? (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                  to={`/exams/${exam.id}/take`}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 text-sm font-medium shadow-lg transition-all duration-200"
                                >
                                  <PlayIcon className="w-4 h-4 mr-2" />
                                  {t('student.startExam', 'Start')}
                                </Link>
                              </motion.div>
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                                <ClockIcon className="w-4 h-4 mr-2" />
                                {t('student.pending', 'Pending')}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Recent Exam Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
                      <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('student.recentResults', 'Recent Results')}
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                {recentExams.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t('student.noRecentResults', 'No recent exam results')}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      {t('student.takeExamToSeeResults', 'Take an exam to see your results here')}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {recentExams.map((exam, index) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        className="relative group/result"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur opacity-0 group-hover/result:opacity-30 transition duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-yellow-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <TrophyIcon className="h-4 w-4 text-yellow-500 mr-2" />
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {exam.title}
                              </h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              {t('student.completedOn', 'Completed on')}{' '}
                              {exam.completedAt.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <motion.div whileHover={{ scale: 1.1 }} className="mb-2">
                              <p
                                className={`text-2xl font-bold ${
                                  exam.score >= 80
                                    ? 'text-green-600 dark:text-green-400'
                                    : exam.score >= 60
                                      ? 'text-yellow-600 dark:text-yellow-400'
                                      : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {exam.score}%
                              </p>
                            </motion.div>
                            <div className="flex items-center text-sm">
                              <ShieldCheckIcon className="h-3 w-3 mr-1 text-purple-500" />
                              <span className="text-gray-500 dark:text-gray-400">
                                {t('student.trust', 'Trust')}:
                              </span>
                              <span className="ml-1 font-medium text-purple-600 dark:text-purple-400">
                                {Math.round(exam.trustScore * 100)}%
                              </span>
                            </div>
                            <div className="mt-1">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${exam.trustScore * 100}%` }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                                className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
