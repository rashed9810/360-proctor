import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  UserIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

/**
 * StudentMonitoringGrid component for real-time monitoring of multiple students
 * @param {Object} props - Component props
 * @param {number} props.examId - ID of the exam being monitored
 * @param {Array} props.initialStudents - Initial list of students to monitor
 * @param {Function} props.onViolationDetected - Callback when a violation is detected
 * @param {Function} props.onStudentSelect - Callback when a student is selected for detailed view
 */
const StudentMonitoringGrid = ({
  examId,
  initialStudents = [],
  onViolationDetected,
  onStudentSelect,
}) => {
  const { t } = useTranslation(['exams', 'translation']);
  const [students, setStudents] = useState(initialStudents);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterViolations, setFilterViolations] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshTimerRef = useRef(null);

  // Connect to WebSocket for real-time updates
  const { lastMessage, isConnected, sendMessage } = useWebSocket(`proctoring/${examId}`, {
    autoConnect: true,
    mockData: true,
  });

  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);

        // Handle different message types
        if (data.type === 'student_update') {
          updateStudentData(data.student);
        } else if (data.type === 'violation') {
          handleViolation(data.violation);
        } else if (data.type === 'trust_score_update') {
          updateTrustScore(data.studentId, data.score);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, onViolationDetected]);

  // Set up auto-refresh timer
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        refreshStudentData();
      }, 30000); // Refresh every 30 seconds
    } else if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh]);

  // Update student data when a WebSocket update is received
  const updateStudentData = updatedStudent => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
      )
    );
  };

  // Handle violation detection
  const handleViolation = violation => {
    // Find the student who had the violation
    const student = students.find(s => s.id === violation.studentId);

    if (student) {
      // Update the student's violation count
      updateStudentData({
        ...student,
        violations: (student.violations || 0) + 1,
        lastViolation: violation,
      });

      // Show a toast notification
      toast.error(`${student.name}: ${t(`violationTypes.${violation.type}`, { ns: 'exams' })}`, {
        duration: 5000,
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
      });

      // Call the callback if provided
      if (onViolationDetected) {
        onViolationDetected(student, violation);
      }
    }
  };

  // Update a student's trust score
  const updateTrustScore = (studentId, score) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, trustScore: score } : student
      )
    );
  };

  // Refresh all student data
  const refreshStudentData = async () => {
    setIsLoading(true);

    // In a real implementation, this would fetch fresh data from the server
    // For now, we'll simulate a refresh with a timeout
    setTimeout(() => {
      // Simulate updated data by slightly modifying trust scores
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          trustScore: Math.max(0, Math.min(1, student.trustScore + (Math.random() * 0.1 - 0.05))),
        }))
      );
      setIsLoading(false);
    }, 1000);
  };

  // Handle student selection for detailed view
  const handleStudentSelect = student => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };

  // Toggle expanded view for a student
  const toggleExpandedView = student => {
    setExpandedStudent(expandedStudent?.id === student.id ? null : student);
  };

  // Sort and filter students
  const sortedAndFilteredStudents = students
    .filter(student => {
      // Apply status filter
      if (filterStatus !== 'all' && student.status !== filterStatus) {
        return false;
      }

      // Apply violations filter
      if (filterViolations === 'with_violations' && !student.violations) {
        return false;
      } else if (filterViolations === 'no_violations' && student.violations) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'trustScore') {
        comparison = (a.trustScore || 0) - (b.trustScore || 0);
      } else if (sortBy === 'violations') {
        comparison = (a.violations || 0) - (b.violations || 0);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('studentMonitoring', { ns: 'exams' })}
          </h2>

          <div className="flex items-center space-x-2">
            {/* Layout toggle */}
            <button
              onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              aria-label={layout === 'grid' ? t('listView') : t('gridView')}
            >
              {layout === 'grid' ? (
                <ComputerDesktopIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>

            {/* Refresh button */}
            <button
              onClick={refreshStudentData}
              disabled={isLoading}
              className={`p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={t('refresh')}
            >
              <svg
                className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allStatuses', { ns: 'exams' })}</option>
            <option value="active">{t('active', { ns: 'exams' })}</option>
            <option value="completed">{t('completed', { ns: 'exams' })}</option>
            <option value="not_started">{t('notStarted', { ns: 'exams' })}</option>
          </select>

          {/* Violations filter */}
          <select
            value={filterViolations}
            onChange={e => setFilterViolations(e.target.value)}
            className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allViolations', { ns: 'exams' })}</option>
            <option value="with_violations">{t('withViolations', { ns: 'exams' })}</option>
            <option value="no_violations">{t('noViolations', { ns: 'exams' })}</option>
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="name">{t('sortByName', { ns: 'exams' })}</option>
            <option value="trustScore">{t('sortByTrustScore', { ns: 'exams' })}</option>
            <option value="violations">{t('sortByViolations', { ns: 'exams' })}</option>
            <option value="status">{t('sortByStatus', { ns: 'exams' })}</option>
          </select>

          {/* Sort order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            aria-label={sortOrder === 'asc' ? t('sortAscending') : t('sortDescending')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* Auto-refresh toggle */}
          <div className="ml-auto flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              {t('autoRefresh')}:
            </span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* WebSocket connection status */}
      {!isConnected && (
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm">
          {t('websocketDisconnected')} - {t('attemptingToReconnect')}
        </div>
      )}

      {/* Student grid/list */}
      <div
        className={`p-4 ${layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}`}
      >
        <AnimatePresence>
          {sortedAndFilteredStudents.length > 0 ? (
            sortedAndFilteredStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                layout={layout}
                isExpanded={expandedStudent?.id === student.id}
                onSelect={handleStudentSelect}
                onToggleExpand={toggleExpandedView}
                t={t}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full p-8 text-center text-gray-500 dark:text-gray-400"
            >
              {t('noStudentsFound', { ns: 'exams' })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Student card component
const StudentCard = ({ student, layout, isExpanded, onSelect, onToggleExpand, t }) => {
  // Calculate trust score color based on value
  const getTrustScoreColor = score => {
    if (score > 0.8) return 'text-green-500 dark:text-green-400';
    if (score > 0.6) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Get status badge color
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
        isExpanded ? 'col-span-full' : ''
      } ${student.violations > 0 ? 'ring-2 ring-red-500/20 dark:ring-red-500/30' : ''}`}
    >
      <div className="p-4">
        {/* Header with student info and actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                student.status
              )}`}
            >
              {student.status === 'active'
                ? t('active', { ns: 'exams' })
                : student.status === 'completed'
                  ? t('completed', { ns: 'exams' })
                  : t('notStarted', { ns: 'exams' })}
            </span>

            {/* Expand/collapse button */}
            <button
              onClick={() => onToggleExpand(student)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {isExpanded ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Student metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <CheckBadgeIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className={`${getTrustScoreColor(student.trustScore || 0)}`}>
              {Math.round((student.trustScore || 0) * 100)}% {t('trustScore', { ns: 'exams' })}
            </span>
          </div>
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span
              className={`${student.violations ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {student.violations || 0} {t('violations', { ns: 'exams' })}
            </span>
          </div>
        </div>

        {/* Expanded view with more details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Webcam feed (placeholder) */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                <VideoCameraIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('webcamFeed', { ns: 'exams' })}
                </span>
              </div>

              {/* Detailed metrics */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('proctorMetrics', { ns: 'exams' })}
                </h4>

                {/* Trust score components */}
                <div className="space-y-2">
                  {/* Face detection score */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        {t('faceDetection', { ns: 'exams' })}
                      </span>
                      <span className={getTrustScoreColor(student.faceDetectionScore || 0)}>
                        {Math.round((student.faceDetectionScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (student.faceDetectionScore || 0) > 0.8
                            ? 'bg-green-500'
                            : (student.faceDetectionScore || 0) > 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(student.faceDetectionScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Eye tracking score */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        {t('eyeTracking', { ns: 'exams' })}
                      </span>
                      <span className={getTrustScoreColor(student.eyeTrackingScore || 0)}>
                        {Math.round((student.eyeTrackingScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (student.eyeTrackingScore || 0) > 0.8
                            ? 'bg-green-500'
                            : (student.eyeTrackingScore || 0) > 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(student.eyeTrackingScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Audio analysis score */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        <MicrophoneIcon className="h-4 w-4 inline mr-1" />
                        {t('audioAnalysis', { ns: 'exams' })}
                      </span>
                      <span className={getTrustScoreColor(student.audioAnalysisScore || 0)}>
                        {Math.round((student.audioAnalysisScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (student.audioAnalysisScore || 0) > 0.8
                            ? 'bg-green-500'
                            : (student.audioAnalysisScore || 0) > 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(student.audioAnalysisScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tab switching score */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        <ComputerDesktopIcon className="h-4 w-4 inline mr-1" />
                        {t('tabSwitching', { ns: 'exams' })}
                      </span>
                      <span className={getTrustScoreColor(student.tabSwitchingScore || 0)}>
                        {Math.round((student.tabSwitchingScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (student.tabSwitchingScore || 0) > 0.8
                            ? 'bg-green-500'
                            : (student.tabSwitchingScore || 0) > 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(student.tabSwitchingScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Phone detection score */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4 inline mr-1" />
                        {t('phoneDetection', { ns: 'exams' })}
                      </span>
                      <span className={getTrustScoreColor(student.phoneDetectionScore || 0)}>
                        {Math.round((student.phoneDetectionScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (student.phoneDetectionScore || 0) > 0.8
                            ? 'bg-green-500'
                            : (student.phoneDetectionScore || 0) > 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(student.phoneDetectionScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onSelect(student)}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors"
              >
                {t('viewDetails', { ns: 'exams' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentMonitoringGrid;
