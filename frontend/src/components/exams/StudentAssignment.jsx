import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserMinusIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Student assignment component for exams
 * @param {Object} props - Component props
 * @param {Array} props.students - List of all available students
 * @param {Array} props.assignedStudents - List of students already assigned to the exam
 * @param {Function} props.onAssign - Function to handle student assignment
 * @param {Function} props.onUnassign - Function to handle student unassignment
 * @param {Function} props.onBatchAssign - Function to handle batch assignment
 */
const StudentAssignment = ({
  students = [],
  assignedStudents = [],
  onAssign,
  onUnassign,
  onBatchAssign,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBatchAssign, setShowBatchAssign] = useState(false);
  const [batchCriteria, setBatchCriteria] = useState({
    group: '',
    course: '',
  });

  // Update filtered students when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = students.filter(
      student =>
        student.name.toLowerCase().includes(lowerCaseSearch) ||
        student.email.toLowerCase().includes(lowerCaseSearch) ||
        student.id.toString().includes(lowerCaseSearch) ||
        (student.group && student.group.toLowerCase().includes(lowerCaseSearch)) ||
        (student.course && student.course.toLowerCase().includes(lowerCaseSearch))
    );

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Handle search input change
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // Handle student selection for batch operations
  const handleStudentSelect = studentId => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  // Handle batch assignment
  const handleBatchAssign = () => {
    onBatchAssign(selectedStudents);
    setSelectedStudents([]);
  };

  // Handle batch unassignment
  const handleBatchUnassign = () => {
    selectedStudents.forEach(studentId => onUnassign(studentId));
    setSelectedStudents([]);
  };

  // Handle batch criteria change
  const handleCriteriaChange = e => {
    const { name, value } = e.target;
    setBatchCriteria(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply batch criteria
  const applyBatchCriteria = () => {
    const { group, course } = batchCriteria;

    if (!group && !course) {
      return;
    }

    const matchingStudents = students.filter(
      student => (group && student.group === group) || (course && student.course === course)
    );

    setSelectedStudents(matchingStudents.map(student => student.id));
  };

  // Get unique groups and courses for filter dropdowns
  const uniqueGroups = [...new Set(students.filter(s => s.group).map(s => s.group))];
  const uniqueCourses = [...new Set(students.filter(s => s.course).map(s => s.course))];

  // Check if a student is assigned
  const isStudentAssigned = studentId => {
    return assignedStudents.some(student => student.id === studentId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('exams.studentAssignment')}
      </h2>

      {/* Search and batch actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('exams.searchStudents')}
          />
        </div>

        {/* Batch actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBatchAssign(!showBatchAssign)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
          >
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {t('exams.batchAssign')}
          </button>

          {selectedStudents.length > 0 && (
            <>
              <button
                onClick={handleBatchAssign}
                className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
              >
                <UserPlusIcon className="h-4 w-4 mr-1" />
                {t('exams.assignSelected', { count: selectedStudents.length })}
              </button>

              <button
                onClick={handleBatchUnassign}
                className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <UserMinusIcon className="h-4 w-4 mr-1" />
                {t('exams.unassignSelected')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Batch assignment criteria */}
      {showBatchAssign && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('exams.batchAssignmentCriteria')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Group filter */}
            <div>
              <label
                htmlFor="group"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.group')}
              </label>
              <select
                id="group"
                name="group"
                value={batchCriteria.group}
                onChange={handleCriteriaChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('exams.selectGroup')}</option>
                {uniqueGroups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Course filter */}
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.course')}
              </label>
              <select
                id="course"
                name="course"
                value={batchCriteria.course}
                onChange={handleCriteriaChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('exams.selectCourse')}</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply button */}
            <div className="flex items-end">
              <button
                onClick={applyBatchCriteria}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('exams.applyFilters')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Students table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={
                      selectedStudents.length > 0 &&
                      selectedStudents.length === filteredStudents.length
                    }
                    onChange={() => {
                      if (selectedStudents.length === filteredStudents.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(filteredStudents.map(student => student.id));
                      }
                    }}
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.studentId')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.studentName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.email')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.group')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.status')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t('exams.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const isAssigned = isStudentAssigned(student.id);
                const isSelected = selectedStudents.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={isSelected}
                          onChange={() => handleStudentSelect(student.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.group || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAssigned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          {t('exams.assigned')}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {t('exams.notAssigned')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isAssigned ? (
                        <button
                          onClick={() => onUnassign(student.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('exams.unassign')}
                        </button>
                      ) : (
                        <button
                          onClick={() => onAssign(student.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          {t('exams.assign')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {searchTerm ? t('exams.noStudentsFound') : t('exams.noStudentsAvailable')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (simplified) */}
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            {t('common.previous')}
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            {t('common.next')}
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('common.showing')} <span className="font-medium">1</span> {t('common.to')}{' '}
              <span className="font-medium">{filteredStudents.length}</span> {t('common.of')}{' '}
              <span className="font-medium">{students.length}</span> {t('common.results')}
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                <span className="sr-only">{t('common.previous')}</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                <span className="sr-only">{t('common.next')}</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignment;
