import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import mockExamService from '../../services/mockExams';
import ExamMonitoring from '../../components/exams/ExamMonitoring';
import StudentAssignment from '../../components/exams/StudentAssignment';
import ExamScheduling from '../../components/exams/ExamScheduling';
import TrustScore from '../../components/exams/TrustScore';

/**
 * Exam detail page component
 */
const ExamDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation(['exams', 'translation']);
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [trustScoreHistory, setTrustScoreHistory] = useState([]);
  const [studentViolations, setStudentViolations] = useState([]);

  // Fetch exam data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const examData = await mockExamService.getExamById(Number(id));
        setExam(examData);

        // Fetch related data
        const [studentsData, assignedStudentsData, violationsData, schedulesData] =
          await Promise.all([
            mockExamService.getStudents(),
            mockExamService.getExamStudents(Number(id)),
            mockExamService.getExamViolations(Number(id)),
            mockExamService.getExamSchedules(Number(id)),
          ]);

        setStudents(studentsData);
        setAssignedStudents(assignedStudentsData);
        setViolations(violationsData);
        setSchedules(schedulesData);

        // Set first student as selected if available
        if (assignedStudentsData.length > 0) {
          setSelectedStudent(assignedStudentsData[0]);

          // Fetch student-specific data
          const [history, studentViolations] = await Promise.all([
            mockExamService.getStudentTrustScoreHistory(assignedStudentsData[0].id),
            mockExamService.getStudentViolations(Number(id), assignedStudentsData[0].id),
          ]);

          setTrustScoreHistory(history);
          setStudentViolations(studentViolations);
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        toast.error(t('common.errorFetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  // Handle student selection
  const handleStudentSelect = async student => {
    setSelectedStudent(student);

    try {
      const [history, violations] = await Promise.all([
        mockExamService.getStudentTrustScoreHistory(student.id),
        mockExamService.getStudentViolations(Number(id), student.id),
      ]);

      setTrustScoreHistory(history);
      setStudentViolations(violations);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error(t('common.errorFetchingData'));
    }
  };

  // Handle data refresh
  const handleRefresh = async () => {
    try {
      const [examData, studentsData, assignedStudentsData, violationsData, schedulesData] =
        await Promise.all([
          mockExamService.getExamById(Number(id)),
          mockExamService.getStudents(),
          mockExamService.getExamStudents(Number(id)),
          mockExamService.getExamViolations(Number(id)),
          mockExamService.getExamSchedules(Number(id)),
        ]);

      setExam(examData);
      setStudents(studentsData);
      setAssignedStudents(assignedStudentsData);
      setViolations(violationsData);
      setSchedules(schedulesData);

      if (selectedStudent) {
        const [history, studentViolations] = await Promise.all([
          mockExamService.getStudentTrustScoreHistory(selectedStudent.id),
          mockExamService.getStudentViolations(Number(id), selectedStudent.id),
        ]);

        setTrustScoreHistory(history);
        setStudentViolations(studentViolations);
      }

      toast.success(t('common.dataRefreshed'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error(t('common.errorRefreshingData'));
    }
  };

  // Handle exam deletion
  const handleDelete = async () => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await mockExamService.deleteExam(Number(id));
        toast.success(t('exams.deleteSuccess'));
        navigate('/exams');
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error(t('exams.deleteError'));
      }
    }
  };

  // Handle student assignment
  const handleAssignStudent = async studentId => {
    try {
      await mockExamService.assignStudent(Number(id), studentId);
      const updatedAssignedStudents = await mockExamService.getExamStudents(Number(id));
      setAssignedStudents(updatedAssignedStudents);
      toast.success(t('exams.studentAssigned'));
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error(t('exams.assignError'));
    }
  };

  // Handle student unassignment
  const handleUnassignStudent = async studentId => {
    try {
      await mockExamService.unassignStudent(Number(id), studentId);
      const updatedAssignedStudents = await mockExamService.getExamStudents(Number(id));
      setAssignedStudents(updatedAssignedStudents);
      toast.success(t('exams.studentUnassigned'));
    } catch (error) {
      console.error('Error unassigning student:', error);
      toast.error(t('exams.unassignError'));
    }
  };

  // Handle batch student assignment
  const handleBatchAssign = async studentIds => {
    try {
      await mockExamService.batchAssignStudents(Number(id), studentIds);
      const updatedAssignedStudents = await mockExamService.getExamStudents(Number(id));
      setAssignedStudents(updatedAssignedStudents);
      toast.success(t('exams.studentsAssigned'));
    } catch (error) {
      console.error('Error batch assigning students:', error);
      toast.error(t('exams.batchAssignError'));
    }
  };

  // Handle schedule addition
  const handleAddSchedule = async scheduleData => {
    try {
      await mockExamService.addExamSchedule(Number(id), scheduleData);
      const updatedSchedules = await mockExamService.getExamSchedules(Number(id));
      setSchedules(updatedSchedules);
      toast.success(t('exams.scheduleAdded'));
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error(t('exams.scheduleAddError'));
    }
  };

  // Handle schedule removal
  const handleRemoveSchedule = async scheduleId => {
    try {
      await mockExamService.removeExamSchedule(scheduleId);
      const updatedSchedules = await mockExamService.getExamSchedules(Number(id));
      setSchedules(updatedSchedules);
      toast.success(t('exams.scheduleRemoved'));
    } catch (error) {
      console.error('Error removing schedule:', error);
      toast.error(t('exams.scheduleRemoveError'));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {t('common.examNotFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('common.examNotFoundDescription')}
          </p>
          <Link
            to="/exams"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {t('common.backToExams')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/exams')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{t('common.back', { ns: 'translation' })}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{exam.subject}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <Link
              to={`/exams/${id}/edit`}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
            >
              <PencilSquareIcon className="h-4 w-4 mr-1" />
              {t('common.edit', { ns: 'translation' })}
            </Link>
            <Link
              to={`/exams/${id}/students`}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
            >
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {t('exams.manageStudents')}
            </Link>
            <button
              onClick={handleDelete}
              className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {t('common.delete', { ns: 'translation' })}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date(exam.startTime).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {new Date(exam.startTime).toLocaleTimeString()} -{' '}
            {new Date(exam.endTime).toLocaleTimeString()}
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {exam.participants} {t('common.participants', { ns: 'translation' })}
          </div>
          <div className="flex items-center">
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            {exam.duration} {t('common.minutes', { ns: 'translation' })}
          </div>
          <div className="flex items-center">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            {t('trustScoreThreshold', { ns: 'exams' })}: {exam.trustScoreThreshold}%
          </div>
          <div className="flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-1" />
            {t(`common.${exam.status}`, { ns: 'translation' })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
          >
            {t('overview', { ns: 'exams' })}
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'monitoring' ? 'page' : undefined}
          >
            {t('monitoring', { ns: 'exams' })}
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'students' ? 'page' : undefined}
          >
            {t('students', { ns: 'exams' })}
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === 'scheduling'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'scheduling' ? 'page' : undefined}
          >
            {t('scheduling', { ns: 'exams' })}
          </button>
          {selectedStudent && (
            <button
              onClick={() => setActiveTab('trustScore')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'trustScore'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              aria-current={activeTab === 'trustScore' ? 'page' : undefined}
            >
              {t('trustScore', { ns: 'exams' })}
            </button>
          )}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t('examDetails', { ns: 'exams' })}
              </h2>

              {exam.description && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('description', { ns: 'exams' })}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{exam.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('schedule', { ns: 'exams' })}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('startDate', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(exam.startTime).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('startTime', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(exam.startTime).toLocaleTimeString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('endDate', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(exam.endTime).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('endTime', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(exam.endTime).toLocaleTimeString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('duration', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.duration} {t('common.minutes')}
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('proctoringSettings', { ns: 'exams' })}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('faceDetection', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.enableFaceDetection ? t('common.yes') : t('common.no')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('multipleFaceDetection', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.enableMultipleFaceDetection ? t('common.yes') : t('common.no')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('eyeTracking', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.enableEyeTracking ? t('common.yes') : t('common.no')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('audioDetection', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.enableAudioDetection ? t('common.yes') : t('common.no')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('tabSwitchingDetection', { ns: 'exams' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.enableTabSwitchDetection ? t('common.yes') : t('common.no')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'monitoring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExamMonitoring
              exam={exam}
              students={assignedStudents}
              violations={violations}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StudentAssignment
              students={students}
              assignedStudents={assignedStudents}
              onAssign={handleAssignStudent}
              onUnassign={handleUnassignStudent}
              onBatchAssign={handleBatchAssign}
            />
          </motion.div>
        )}

        {activeTab === 'scheduling' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExamScheduling
              schedules={schedules}
              onScheduleAdd={scheduleData => handleAddSchedule(scheduleData)}
              onScheduleRemove={handleRemoveSchedule}
            />
          </motion.div>
        )}

        {activeTab === 'trustScore' && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrustScore
              student={selectedStudent}
              trustHistory={trustScoreHistory}
              violations={studentViolations}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
