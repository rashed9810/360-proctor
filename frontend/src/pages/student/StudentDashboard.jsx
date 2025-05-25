import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { examService } from '../../api';
import toast from 'react-hot-toast';
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('student.totalExams', 'Total Exams')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {studentStats.totalExams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('student.completedExams', 'Completed')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {studentStats.completedExams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('student.averageScore', 'Average Score')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {studentStats.averageScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('student.trustScore', 'Trust Score')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(studentStats.averageTrustScore * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('student.upcomingExams', 'Upcoming Exams')}
                </h2>
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {upcomingExams.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('student.noUpcomingExams', 'No upcoming exams scheduled')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.map(exam => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {exam.startTime.toLocaleDateString()} at{' '}
                          {exam.startTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {formatTimeUntilExam(exam.startTime)}
                        </p>
                      </div>
                      <div className="ml-4">
                        {exam.canStart ? (
                          <Link
                            to={`/exams/${exam.id}/take`}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <PlayIcon className="w-4 h-4 mr-2" />
                            {t('student.startExam', 'Start')}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            {t('student.pending', 'Pending')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Exam Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('student.recentResults', 'Recent Results')}
                </h2>
                <TrophyIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentExams.length === 0 ? (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('student.noRecentResults', 'No recent exam results')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentExams.map(exam => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('student.completedOn', 'Completed on')}{' '}
                          {exam.completedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p
                          className={`text-lg font-bold ${
                            exam.score >= 80
                              ? 'text-green-600'
                              : exam.score >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {exam.score}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('student.trust', 'Trust')}: {Math.round(exam.trustScore * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
