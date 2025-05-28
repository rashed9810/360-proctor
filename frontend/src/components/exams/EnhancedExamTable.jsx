import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced exam table component with export and filter functionality
 * @param {Object} props - Component props
 * @param {Array} props.exams - List of exams to display
 * @param {Function} props.onExport - Function to handle export
 * @param {string} props.type - Type of exams ('upcoming' or 'recent')
 */
const EnhancedExamTable = ({ exams = [], onExport, type = 'upcoming' }) => {
  const { t } = useTranslation();
  const [filteredExams, setFilteredExams] = useState(exams);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    dateRange: 'all', // 'today', 'week', 'month', 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'asc',
  });
  const filterRef = useRef(null);

  // Update filtered exams when exams, search term, or filters change
  useEffect(() => {
    let result = [...exams];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        exam =>
          exam.title.toLowerCase().includes(term) ||
          (exam.subject && exam.subject.toLowerCase().includes(term))
      );
    }

    // Apply subject filter
    if (filters.subject) {
      result = result.filter(
        exam => exam.subject && exam.subject.toLowerCase() === filters.subject.toLowerCase()
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const examDates = result.map(exam => new Date(exam.date));

      switch (filters.dateRange) {
        case 'today':
          result = result.filter(exam => {
            const examDate = new Date(exam.date);
            return (
              examDate.getDate() === today.getDate() &&
              examDate.getMonth() === today.getMonth() &&
              examDate.getFullYear() === today.getFullYear()
            );
          });
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          result = result.filter(exam => {
            const examDate = new Date(exam.date);
            return examDate >= today && examDate <= weekFromNow;
          });
          break;
        case 'month':
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);
          result = result.filter(exam => {
            const examDate = new Date(exam.date);
            return examDate >= today && examDate <= monthFromNow;
          });
          break;
        default:
          break;
      }
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredExams(result);
  }, [exams, searchTerm, filters, sortConfig]);

  // Handle sort request
  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle export to CSV
  const handleExport = format => {
    if (typeof onExport === 'function') {
      onExport(filteredExams, format);
    } else {
      // Default export implementation
      if (format === 'csv') {
        exportToCSV(filteredExams);
      } else if (format === 'pdf') {
        exportToPDF(filteredExams);
      }
    }
  };

  // Default CSV export implementation
  const exportToCSV = data => {
    const headers = ['Title', 'Date', 'Time', 'Duration', 'Status'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map(exam =>
          [
            `"${exam.title}"`,
            exam.date,
            exam.time,
            `${exam.duration} ${t('minutes')}`,
            exam.status || (type === 'upcoming' ? t('scheduled') : t('completed')),
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}-exams.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Default PDF export implementation (placeholder)
  const exportToPDF = data => {
    console.log('Export to PDF:', data);
    alert('PDF export functionality would be implemented here with a library like jsPDF');
  };

  // Get unique subjects for filter dropdown
  const subjects = [...new Set(exams.filter(exam => exam.subject).map(exam => exam.subject))];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {type === 'upcoming' ? t('upcomingExams') : t('recentExams')}
          </h2>
          <div className="flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                {t('filter')}
              </button>
              {showFilters && (
                <div
                  ref={filterRef}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('filters')}
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('subject')}
                      </label>
                      <select
                        value={filters.subject}
                        onChange={e => setFilters({ ...filters, subject: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">{t('all')}</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('dateRange')}
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={e => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="all">{t('allDates')}</option>
                        <option value="today">{t('today')}</option>
                        <option value="week">{t('nextWeek')}</option>
                        <option value="month">{t('nextMonth')}</option>
                      </select>
                    </div>
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setFilters({ subject: '', dateRange: 'all' })}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {t('resetFilters')}
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                      >
                        {t('apply')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {t('export')}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('searchExams')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        {filteredExams.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('noExamsFound')}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center">
                    {t('title')}
                    {sortConfig.key === 'title' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    {t('date')}
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
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
              {filteredExams.map(exam => {
                // Calculate time until exam
                const examDate = new Date(exam.date + ' ' + exam.time);
                const now = new Date();
                const timeUntil = examDate - now;
                const hoursUntil = timeUntil / (1000 * 60 * 60);

                // Determine status color and text
                let statusColor =
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
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
                        {hoursUntil < 48 && type === 'upcoming' && (
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
                        {type === 'upcoming' && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="bg-primary-500 h-1.5 rounded-full transition-all duration-1000 ease-in-out"
                              style={{
                                width: progressWidth,
                                animation: hoursUntil < 2 ? 'pulse 1.5s infinite' : 'none',
                              }}
                              animate={{
                                width: progressWidth,
                              }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/exams/${exam.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-xs font-medium rounded text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-150"
                      >
                        {type === 'upcoming' ? t('view') : t('viewResults')}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EnhancedExamTable;
