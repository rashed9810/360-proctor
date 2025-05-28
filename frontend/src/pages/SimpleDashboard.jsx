import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';

const SimpleDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('welcomeBack')}, {user?.name}
        </h1>

        <p className="text-gray-600 mb-4">{t('dashboard.overview')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-blue-800">{t('totalStudents')}</h2>
            <p className="text-3xl font-bold text-blue-900">156</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800">{t('activeExams')}</h2>
            <p className="text-3xl font-bold text-green-900">3</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="font-semibold text-purple-800">{t('completedExams')}</h2>
            <p className="text-3xl font-bold text-purple-900">24</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('upcomingExams')}</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-900">Mathematics Final Exam</h3>
              <span className="text-sm text-gray-500">2023-06-15</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">10:00 AM • 120 {t('minutes')}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-900">Physics Midterm</h3>
              <span className="text-sm text-gray-500">2023-06-20</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">2:00 PM • 90 {t('minutes')}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('recentExams')}</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('exam')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('score')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Chemistry Quiz</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">2023-06-01</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">85%</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Biology Test</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">2023-05-28</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">78%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
