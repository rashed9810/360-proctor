import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Mock data
      setStats({
        totalUsers: 125,
        totalExams: 42,
        activeExams: 8,
        completedExams: 34,
        averageTrustScore: 0.87,
      });

      setUsers([
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
        },
        {
          id: 2,
          name: 'Teacher User',
          email: 'teacher@example.com',
          role: 'teacher',
          isActive: true,
        },
        {
          id: 3,
          name: 'Student User',
          email: 'student@example.com',
          role: 'student',
          isActive: true,
        },
        {
          id: 4,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          isActive: true,
        },
        {
          id: 5,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'teacher',
          isActive: false,
        },
      ]);

      setExams([
        {
          id: 1,
          title: 'Mathematics Final Exam',
          creator: 'Teacher User',
          date: '2023-06-15',
          status: 'published',
          participants: 45,
        },
        {
          id: 2,
          title: 'Physics Midterm',
          creator: 'Jane Smith',
          date: '2023-06-20',
          status: 'published',
          participants: 32,
        },
        {
          id: 3,
          title: 'Chemistry Quiz',
          creator: 'Teacher User',
          date: '2023-06-01',
          status: 'completed',
          participants: 38,
        },
      ]);

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('adminDashboard')}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-primary-50 border border-primary-100">
          <h3 className="text-sm font-medium text-primary-800">{t('totalUsers')}</h3>
          <p className="mt-2 text-3xl font-bold text-primary-900">{stats.totalUsers}</p>
        </div>

        <div className="card bg-secondary-50 border border-secondary-100">
          <h3 className="text-sm font-medium text-secondary-800">{t('totalExams')}</h3>
          <p className="mt-2 text-3xl font-bold text-secondary-900">{stats.totalExams}</p>
        </div>

        <div className="card bg-green-50 border border-green-100">
          <h3 className="text-sm font-medium text-green-800">{t('activeExams')}</h3>
          <p className="mt-2 text-3xl font-bold text-green-900">{stats.activeExams}</p>
        </div>

        <div className="card bg-blue-50 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800">{t('completedExams')}</h3>
          <p className="mt-2 text-3xl font-bold text-blue-900">{stats.completedExams}</p>
        </div>

        <div className="card bg-yellow-50 border border-yellow-100">
          <h3 className="text-sm font-medium text-yellow-800">{t('avgTrustScore')}</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-900">
            {Math.round(stats.averageTrustScore * 100)}%
          </p>
        </div>
      </div>

      {/* Users */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('users')}</h2>
          <Link
            to="/admin/users"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {t('viewAll')}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('name')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('email')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('role')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('status')}
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
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'teacher'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {t(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      {t('view')}
                    </Link>
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="text-secondary-600 hover:text-secondary-900"
                    >
                      {t('edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exams */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('exams')}</h2>
          <Link to="/exams" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {t('viewAll')}
          </Link>
        </div>

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
                  {t('creator')}
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
                  {t('status')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('participants')}
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
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{exam.creator}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{exam.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        exam.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : exam.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {t(exam.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{exam.participants}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/exams/${exam.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      {t('view')}
                    </Link>
                    <Link
                      to={`/exams/${exam.id}/edit`}
                      className="text-secondary-600 hover:text-secondary-900"
                    >
                      {t('edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
