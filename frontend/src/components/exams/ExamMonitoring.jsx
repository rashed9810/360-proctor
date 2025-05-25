import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  UserIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  EyeIcon,
  VideoCameraIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StudentMonitoringGrid from '../proctoring/StudentMonitoringGrid';

/**
 * Exam monitoring dashboard component
 * @param {Object} props - Component props
 * @param {Object} props.exam - Exam data
 * @param {Array} props.students - List of students taking the exam
 * @param {Array} props.violations - List of violations
 * @param {Function} props.onRefresh - Function to handle data refresh
 */
const ExamMonitoring = ({ exam, students = [], violations = [], onRefresh }) => {
  const { t } = useTranslation(['exams', 'translation']);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.status === 'active').length;
  const completedStudents = students.filter(student => student.status === 'completed').length;
  const notStartedStudents = students.filter(student => student.status === 'not_started').length;

  const highViolations = violations.filter(v => v.severity === 'high').length;
  const mediumViolations = violations.filter(v => v.severity === 'medium').length;
  const lowViolations = violations.filter(v => v.severity === 'low').length;

  // Prepare chart data
  const statusData = [
    { name: t('active', { ns: 'exams' }), value: activeStudents, color: '#4ADE80' },
    { name: t('completed', { ns: 'exams' }), value: completedStudents, color: '#3B82F6' },
    { name: t('notStarted', { ns: 'exams' }), value: notStartedStudents, color: '#94A3B8' },
  ];

  const violationData = [
    { name: t('highSeverity', { ns: 'exams' }), value: highViolations, color: '#EF4444' },
    { name: t('mediumSeverity', { ns: 'exams' }), value: mediumViolations, color: '#F59E0B' },
    { name: t('lowSeverity', { ns: 'exams' }), value: lowViolations, color: '#3B82F6' },
  ];

  const violationTypeData = [
    {
      name: 'Face Not Detected',
      count: violations.filter(v => v.type === 'face_not_detected').length,
      key: 'face_not_detected',
    },
    {
      name: 'Multiple Faces',
      count: violations.filter(v => v.type === 'multiple_faces').length,
      key: 'multiple_faces',
    },
    {
      name: 'Looking Away',
      count: violations.filter(v => v.type === 'looking_away').length,
      key: 'looking_away',
    },
    {
      name: 'Suspicious Audio',
      count: violations.filter(v => v.type === 'audio_detected').length,
      key: 'audio_detected',
    },
    {
      name: 'Tab Switch',
      count: violations.filter(v => v.type === 'tab_switch').length,
      key: 'tab_switch',
    },
    {
      name: 'Phone Detected',
      count: violations.filter(v => v.type === 'phone_detected').length,
      key: 'phone_detected',
    },
  ];

  // Filter students based on status
  const filteredStudents =
    filterStatus === 'all' ? students : students.filter(student => student.status === filterStatus);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Handle student selection
  const handleStudentSelect = student => {
    setSelectedStudent(student);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('monitoring', { ns: 'exams' })} - {exam.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(exam.startTime).toLocaleString()} -{' '}
              {new Date(exam.endTime).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh', { ns: 'translation' })}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('overview', { ns: 'exams' })}
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'students'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('students', { ns: 'exams' })}
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'violations'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('violations', { ns: 'exams' })}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Students */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('totalStudents', { ns: 'exams' })}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Students */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                    <ClockIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('activeStudents', { ns: 'exams' })}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {activeStudents}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('completed', { ns: 'exams' })}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {completedStudents}
                    </p>
                  </div>
                </div>
              </div>

              {/* Violations */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-4">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('totalViolations', { ns: 'exams' })}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {violations.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Status Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('studentStatus', { ns: 'exams' })}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                        }
                        paddingAngle={5}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Violation Types Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('violationTypes', { ns: 'exams' })}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={violationTypeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={value => [value, 'Count']} />
                      <Bar dataKey="count" fill="#3B82F6" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Real-time student monitoring grid */}
            <StudentMonitoringGrid
              examId={exam.id}
              initialStudents={students}
              onViolationDetected={(student, violation) => {
                console.log('Violation detected:', student, violation);
                // You could trigger additional actions here
              }}
              onStudentSelect={handleStudentSelect}
            />
          </motion.div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Violation severity chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('violationSeverity', { ns: 'exams' })}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={violationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                      paddingAngle={5}
                    >
                      {violationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Violations list */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('student', { ns: 'exams' })}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('violationType', { ns: 'exams' })}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('severity', { ns: 'exams' })}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('timestamp', { ns: 'exams' })}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('actions', { ns: 'exams' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {violations.length > 0 ? (
                    violations.map(violation => (
                      <tr key={violation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {violation.studentName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {t(`violationTypes.${violation.type}`, { ns: 'exams' })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {violation.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              violation.severity === 'high'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : violation.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {t(`${violation.severity}Severity`, { ns: 'exams' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(violation.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            {t('view', { ns: 'exams' })}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {t('noViolationsRecorded', { ns: 'exams' })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExamMonitoring;
