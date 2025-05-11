import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import mockExamService from '../services/mockExams';
import mockStudentService from '../services/mockStudents';
import StatCard from '../components/dashboard/StatCard';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import FeedbackForm from '../components/common/FeedbackForm';

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
  const { user } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all exams
        const exams = await mockExamService.getAllExams();

        // Filter upcoming exams
        const upcoming = exams
          .filter(exam => exam.status === 'scheduled')
          .map(exam => ({
            id: exam.id,
            title: exam.name,
            date: exam.date,
            time: exam.startTime.split(' ')[1],
            duration: parseInt(exam.duration.split(' ')[0]),
          }));

        // Filter recent exams
        const recent = exams
          .filter(exam => exam.status === 'completed')
          .map(exam => ({
            id: exam.id,
            title: exam.name,
            date: exam.date,
            time: exam.startTime.split(' ')[1],
            duration: parseInt(exam.duration.split(' ')[0]),
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            trustScore: (Math.floor(Math.random() * 30) + 70) / 100, // Random trust score between 0.7-1.0
          }));

        setUpcomingExams(upcoming);
        setRecentExams(recent);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('welcomeBack')}, {user?.name}
        </h1>
      </div>

      {/* Quick Action Panel */}
      <QuickActionPanel />

      {/* Feedback Form */}
      <FeedbackForm />

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <StatCard
            key={stat.name}
            title={t(stat.name)}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
            linkTo={stat.linkTo}
            linkText={t('viewAll')}
          />
        ))}
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('upcomingExams')}
          </h2>
          <Link
            to="/exams"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/50 text-sm font-medium transition-colors duration-150"
          >
            {t('viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {upcomingExams.length === 0 ? (
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
                  let statusText = t('scheduled');
                  let progressWidth = '25%';

                  if (hoursUntil < 24) {
                    statusColor =
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                    statusText = t('upcoming');
                    progressWidth = '75%';
                  }

                  if (hoursUntil < 2) {
                    statusColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                    statusText = t('imminent');
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
      </div>
    </div>
  );
};

export default Dashboard;
