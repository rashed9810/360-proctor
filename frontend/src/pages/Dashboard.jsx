import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import { UsersIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import mockExamService from '../services/mockExams';
import mockStudentService from '../services/mockStudents';

const stats = [
  {
    name: 'totalStudents',
    icon: UsersIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'activeExams',
    icon: ClipboardDocumentListIcon,
    color: 'bg-green-500',
  },
  {
    name: 'completedExams',
    icon: CheckCircleIcon,
    color: 'bg-purple-500',
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
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcomeBack')}, {user?.name}
        </h1>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('totalStudents')}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">42</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/students" className="font-medium text-blue-700 hover:text-blue-900">
                {t('viewAll')}
              </Link>
            </div>
          </div>
        </div>

        {/* Active Exams */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('activeExams')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">3</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/exams" className="font-medium text-green-700 hover:text-green-900">
                {t('viewAll')}
              </Link>
            </div>
          </div>
        </div>

        {/* Completed Exams */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('completedExams')}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">12</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/exams" className="font-medium text-purple-700 hover:text-purple-900">
                {t('viewAll')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('upcomingExams')}</h2>
          <Link
            to="/exams"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('viewAll')}
            <svg
              className="ml-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">{t('noExamsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('title')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('date')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('time')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('duration')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingExams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {exam.duration} {t('minutes')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/exams/${exam.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50"
                      >
                        {t('view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Exams */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('recentExams')}</h2>
        </div>

        {recentExams.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">{t('noExamsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('title')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('date')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('score')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('trustScore')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.score}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          exam.trustScore > 0.8
                            ? 'bg-green-100 text-green-800'
                            : exam.trustScore > 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(exam.trustScore * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/exams/${exam.id}/results`}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50"
                      >
                        {t('viewResults')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
