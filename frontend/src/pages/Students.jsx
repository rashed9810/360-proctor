import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import mockStudentService from '../services/mockStudents';

export default function Students() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await mockStudentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      setError(t('students.fetchError') || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = student => {
    // In a real app, this would open an edit modal with the student data
    console.log('Edit student:', student);
    // For now, just show an alert
    alert(`Edit student: ${student.name}`);
  };

  const handleDelete = async id => {
    // In a real app, this would show a confirmation dialog
    if (
      window.confirm(t('students.confirmDelete') || 'Are you sure you want to delete this student?')
    ) {
      try {
        await mockStudentService.deleteStudent(id);
        // Refresh the student list
        fetchStudents();
      } catch (error) {
        setError(t('students.deleteError') || 'Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header with responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('students.title')}</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <PlusIcon
            className="-ml-0.5 sm:-ml-1 mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"
            aria-hidden="true"
          />
          {t('students.addStudent')}
        </button>
      </div>

      {/* Search box with responsive design */}
      <div className="mb-4 sm:mb-6">
        <div className="relative max-w-full sm:max-w-md w-full">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm pl-9 sm:pl-10 py-1.5 sm:py-2"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Responsive table with horizontal scrolling */}
      <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3 px-3 sm:py-3.5 sm:pl-6 sm:pr-3 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900"
                >
                  {t('students.name')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900"
                >
                  {t('students.email')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900 hidden sm:table-cell"
                >
                  {t('students.roll')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900 hidden md:table-cell"
                >
                  {t('students.class')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900 hidden md:table-cell"
                >
                  {t('students.section')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-medium sm:font-semibold text-gray-900"
                >
                  {t('students.status')}
                </th>
                <th
                  scope="col"
                  className="relative py-3 px-3 sm:py-3.5 sm:pl-3 sm:pr-6 text-right text-xs sm:text-sm font-medium sm:font-semibold text-gray-900"
                >
                  <span className="sr-only">{t('common.actions')}</span>
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-6 pr-3 text-xs sm:text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                    {student.roll}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                    {student.class}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                    {student.section}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t(`students.${student.status}`)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-3 sm:py-4 pl-3 pr-3 sm:pr-6 text-right text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-150"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 border border-red-600 text-xs font-medium rounded text-red-600 bg-white hover:bg-red-50 transition-colors duration-150"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                    <p>{t('students.noStudents')}</p>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                    >
                      <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      {t('students.addStudent')}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal - Responsive */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-0">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-xs sm:max-w-md md:max-w-lg">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  {t('students.addStudent')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <span className="sr-only">{t('common.close')}</span>
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Form fields would go here */}
              <div className="space-y-4 mt-4">
                <div>
                  <label htmlFor="student-name" className="block text-sm font-medium text-gray-700">
                    {t('students.name')}
                  </label>
                  <input
                    type="text"
                    id="student-name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={t('students.namePlaceholder')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('students.email')}
                  </label>
                  <input
                    type="email"
                    id="student-email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={t('students.emailPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="student-roll"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t('students.roll')}
                    </label>
                    <input
                      type="text"
                      id="student-roll"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder={t('students.rollPlaceholder')}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="student-status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t('students.status')}
                    </label>
                    <select
                      id="student-status"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="active">{t('students.active')}</option>
                      <option value="inactive">{t('students.inactive')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
