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
 * Enhanced Student assignment component for exams with improved UI
 * @param {Object} props - Component props
 * @param {Array} props.students - List of all available students
 * @param {Array} props.assignedStudents - List of students already assigned to the exam
 * @param {Function} props.onAssign - Function to handle student assignment
 * @param {Function} props.onUnassign - Function to handle student unassignment
 * @param {Function} props.onBatchAssign - Function to handle batch assignment
 */
const EnhancedStudentAssignment = ({
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
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCriteria, setBatchCriteria] = useState({
    group: '',
    course: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Calculate pagination
  const paginatedStudents = filteredStudents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const hasNextPage = (currentPage + 1) * pageSize < filteredStudents.length;

  // Update filtered students when search term or students change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = students.filter(
        student =>
          student.name.toLowerCase().includes(lowercasedTerm) ||
          student.email.toLowerCase().includes(lowercasedTerm) ||
          (student.group && student.group.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(0);
  }, [searchTerm, students]);

  // Handle search input change
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // Handle student selection
  const handleStudentSelect = studentId => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Handle batch assignment
  const handleBatchAssign = () => {
    if (selectedStudents.length === 0) return;
    onBatchAssign(selectedStudents);
    setSelectedStudents([]);
  };

  // Handle batch unassignment
  const handleBatchUnassign = () => {
    if (selectedStudents.length === 0) return;
    selectedStudents.forEach(studentId => {
      if (isStudentAssigned(studentId)) {
        onUnassign(studentId);
      }
    });
    setSelectedStudents([]);
  };

  // Handle criteria change for batch assignment
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
    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-2">
          {t('exams.studentAssignment')}
        </h2>
        <p className="text-gray-400 text-sm">
          Assign students to this exam or manage existing assignments
        </p>
      </div>

      {/* Search and batch actions */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('exams.searchStudents')}
          />
        </div>

        {/* Batch assign button */}
        <button
          onClick={() => setShowBatchModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-lg hover:shadow-blue-500/20"
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          {t('exams.batchAssign')}
        </button>
      </div>

      {/* Students table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every(student => selectedStudents.includes(student.id))
                    }
                    onChange={() => {
                      if (paginatedStudents.every(student => selectedStudents.includes(student.id))) {
                        setSelectedStudents(selectedStudents.filter(
                          id => !paginatedStudents.some(student => student.id === id)
                        ));
                      } else {
                        const newSelectedIds = paginatedStudents
                          .filter(student => !selectedStudents.includes(student.id))
                          .map(student => student.id);
                        setSelectedStudents([...selectedStudents, ...newSelectedIds]);
                      }
                    }}
                  />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('exams.studentName')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('exams.email')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('exams.group')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('exams.status')}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                {t('exams.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map(student => {
                const isAssigned = isStudentAssigned(student.id);
                const isSelected = selectedStudents.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`${
                      isSelected ? 'bg-blue-900/30' : 'bg-gray-900'
                    } hover:bg-gray-800 transition-colors duration-150`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                          checked={isSelected}
                          onChange={() => handleStudentSelect(student.id)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-800">
                        {student.group || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isAssigned ? (
                        <span className="px-2 py-1 inline-flex text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-800">
                          {t('exams.assigned')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs font-medium rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                          {t('exams.notAssigned')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {isAssigned ? (
                        <button
                          onClick={() => onUnassign(student.id)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors duration-150 border border-red-800"
                        >
                          {t('exams.unassign')}
                        </button>
                      ) : (
                        <button
                          onClick={() => onAssign(student.id)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 transition-colors duration-150 border border-blue-800"
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
                  colSpan="6"
                  className="px-4 py-6 text-center text-sm text-gray-400 bg-gray-900/50"
                >
                  {searchTerm ? t('exams.noStudentsFound') : t('exams.noStudentsAvailable')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {t('common.showing')} <span className="font-medium text-white">{currentPage * pageSize + 1}</span> {t('common.to')}{' '}
          <span className="font-medium text-white">{Math.min((currentPage + 1) * pageSize, filteredStudents.length)}</span> {t('common.of')}{' '}
          <span className="font-medium text-white">{filteredStudents.length}</span> {t('common.results')}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={`p-2 rounded-md ${
              currentPage === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            } transition-colors duration-150`}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium text-white">
            {currentPage + 1}
          </div>
          <button
            onClick={() => setCurrentPage(prev => (hasNextPage ? prev + 1 : prev))}
            disabled={!hasNextPage}
            className={`p-2 rounded-md ${
              !hasNextPage
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            } transition-colors duration-150`}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentAssignment;
