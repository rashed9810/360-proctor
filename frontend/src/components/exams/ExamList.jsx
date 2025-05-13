import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import CustomDropdown from '../common/CustomDropdown';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Exam list component
 * @param {Object} props - Component props
 * @param {Array} props.exams - List of exams
 * @param {Function} props.onDelete - Function to handle exam deletion
 * @param {Function} props.onDuplicate - Function to handle exam duplication
 * @param {boolean} props.isLoading - Whether the data is loading
 * @param {Function} props.onRefresh - Function to handle data refresh
 */
const ExamList = ({ exams = [], onDelete, onDuplicate, isLoading = false, onRefresh }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExams, setFilteredExams] = useState(exams);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Update filtered exams when exams, search term, or filters change
  useEffect(() => {
    let result = [...exams];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        exam =>
          exam.title.toLowerCase().includes(lowerCaseSearch) ||
          exam.subject.toLowerCase().includes(lowerCaseSearch) ||
          exam.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(exam => exam.status === filters.status);
    }

    // Apply subject filter
    if (filters.subject !== 'all') {
      result = result.filter(exam => exam.subject === filters.subject);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'participants':
          comparison = a.participants - b.participants;
          break;
        case 'date':
        default:
          const dateA = parseISO(a.startTime);
          const dateB = parseISO(b.startTime);
          if (isValid(dateA) && isValid(dateB)) {
            comparison = dateA.getTime() - dateB.getTime();
          }
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredExams(result);
  }, [exams, searchTerm, filters, sortBy, sortOrder]);

  // Get unique subjects for filter
  const uniqueSubjects = ['all', ...new Set(exams.map(exam => exam.subject))];

  // Handle search input change
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle sort change
  const handleSortChange = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = status => {
    switch (status) {
      case 'scheduled':
        return <CalendarIcon className="h-4 w-4" />;
      case 'ongoing':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = dateString => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'PPP');
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format time
  const formatTime = dateString => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'p');
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('exams.title')}
          </h2>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Link
              to="/exams/create"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('exams.createExam')}
            </Link>
            <button
              onClick={onRefresh}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Exam Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 mr-3">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {t('common.scheduled')}
              </p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {exams.filter(exam => exam.status === 'scheduled').length}
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 mr-3">
              <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {t('common.ongoing')}
              </p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                {exams.filter(exam => exam.status === 'ongoing').length}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex items-center">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
              <CheckCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {t('common.completed')}
              </p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {exams.filter(exam => exam.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              placeholder={t('common.search')}
            />
          </div>

          {/* Filter and sort controls */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2.5 border rounded-lg shadow-sm text-sm font-medium flex items-center transition-colors duration-200 ${
                showFilters
                  ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <FunnelIcon className="h-4 w-4 mr-1.5" />
              {t('common.filters')}
              {(filters.status !== 'all' || filters.subject !== 'all') && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  {(filters.status !== 'all' ? 1 : 0) + (filters.subject !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort dropdown with custom component */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 hidden sm:inline">
                {t('common.sortBy')}:
              </span>
              <CustomDropdown
                value={`${sortBy}-${sortOrder}`}
                onChange={value => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                options={[
                  { value: 'date-desc', label: t('common.sortByDateDesc') },
                  { value: 'date-asc', label: t('common.sortByDateAsc') },
                  { value: 'title-asc', label: t('common.sortByTitleAsc') },
                  { value: 'title-desc', label: t('common.sortByTitleDesc') },
                  { value: 'subject-asc', label: t('common.sortBySubjectAsc') },
                  { value: 'subject-desc', label: t('common.sortBySubjectDesc') },
                  { value: 'participants-desc', label: t('common.sortByParticipantsDesc') },
                  { value: 'participants-asc', label: t('common.sortByParticipantsAsc') },
                ]}
                position="bottom"
                className="min-w-[180px] sm:min-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Filter options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 p-4 bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('common.advancedFilters')}
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('common.status')}
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="scheduled">{t('common.scheduled')}</option>
                  <option value="ongoing">{t('common.ongoing')}</option>
                  <option value="completed">{t('common.completed')}</option>
                </select>
              </div>

              {/* Subject filter */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('exams.subject')}
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t('common.all')}</option>
                  {uniqueSubjects
                    .filter(subject => subject !== 'all')
                    .map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                </select>
              </div>

              {/* Participant count range filter - placeholder for future implementation */}
              <div>
                <label
                  htmlFor="participantsRange"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('common.participants')}
                </label>
                <select
                  id="participantsRange"
                  name="participantsRange"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white opacity-60"
                  disabled
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="1-30">1-30</option>
                  <option value="31-60">31-60</option>
                  <option value="60+">60+</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setFilters({ status: 'all', subject: 'all' });
                  setShowFilters(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              >
                {t('common.reset')}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              >
                {t('common.apply')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Exam list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          // Loading state
          <div className="p-6 text-center">
            <ArrowPathIcon className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : filteredExams.length > 0 ? (
          // Exam items
          filteredExams.map(exam => (
            <div
              key={exam.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/10 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {exam.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm ${getStatusBadgeClass(
                        exam.status
                      )}`}
                    >
                      {getStatusIcon(exam.status)}
                      {t(`common.${exam.status}`)}
                    </span>
                    <div className="flex items-center bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md ml-auto md:ml-0">
                      <span className="font-medium text-primary-700 dark:text-primary-300 text-xs">
                        {exam.subject}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-2xl">
                    {exam.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-3 gap-y-2">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-300" />
                      {formatDate(exam.startTime)}
                    </div>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-300" />
                      {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                    </div>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                      <UserGroupIcon className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-300" />
                      {exam.participants} {t('common.participants')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3 md:mt-0 ml-auto">
                  <div className="relative inline-block text-left">
                    <div className="dropdown-container">
                      <button
                        type="button"
                        className="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                        id={`exam-menu-${exam.id}`}
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={e => {
                          e.currentTarget.nextElementSibling.classList.toggle('hidden');
                        }}
                        onBlur={e => {
                          // Hide dropdown when focus is lost, but not if focus is moving to an element inside the dropdown
                          setTimeout(() => {
                            if (
                              !e.currentTarget.nextElementSibling.contains(document.activeElement)
                            ) {
                              e.currentTarget.nextElementSibling.classList.add('hidden');
                            }
                          }, 100);
                        }}
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby={`exam-menu-${exam.id}`}
                        tabIndex="-1"
                      >
                        <div className="py-1" role="none">
                          <Link
                            to={`/exams/${exam.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            <PencilSquareIcon className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </Link>
                          <button
                            onClick={() => onDuplicate(exam.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                            {t('common.duplicate')}
                          </button>
                          <button
                            onClick={() => onDelete(exam.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/exams/${exam.id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {t('common.view')}
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {searchTerm || filters.status !== 'all' || filters.subject !== 'all'
                ? t('common.noResultsFound')
                : t('exams.noExamsYet')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filters.status !== 'all' || filters.subject !== 'all'
                ? t('common.tryAdjustingFilters')
                : t('exams.createYourFirstExam')}
            </p>
            {!searchTerm && filters.status === 'all' && filters.subject === 'all' && (
              <Link
                to="/exams/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                {t('exams.createExam')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
