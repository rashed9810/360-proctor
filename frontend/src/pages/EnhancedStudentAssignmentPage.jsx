import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EnhancedStudentAssignment from '../components/exams/EnhancedStudentAssignment';
import { mockExamService } from '../services/mockExams';
import { mockStudentService } from '../services/mockStudents';
import ErrorDisplay from '../components/common/ErrorDisplay';

/**
 * Enhanced Student Assignment Page
 * Demonstrates the improved UI for student assignment
 */
const EnhancedStudentAssignmentPage = () => {
  const { t } = useTranslation();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch exam details
        const examData = await mockExamService.getExamById(parseInt(examId));
        setExam(examData);

        // Fetch all students
        const allStudents = await mockStudentService.getAllStudents();
        setStudents(allStudents);

        // Fetch assigned students
        const assigned = await mockExamService.getAssignedStudents(parseInt(examId));
        setAssignedStudents(assigned);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('exams.fetchError'));
        toast.error(t('exams.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, t]);

  // Handle student assignment
  const handleAssignStudent = async studentId => {
    try {
      await mockExamService.assignStudent(parseInt(examId), studentId);
      // Update assigned students list
      const assigned = await mockExamService.getAssignedStudents(parseInt(examId));
      setAssignedStudents(assigned);
      toast.success(t('exams.studentAssigned'));
    } catch (err) {
      console.error('Error assigning student:', err);
      toast.error(t('exams.assignError'));
    }
  };

  // Handle student unassignment
  const handleUnassignStudent = async studentId => {
    try {
      await mockExamService.unassignStudent(parseInt(examId), studentId);
      // Update assigned students list
      const assigned = await mockExamService.getAssignedStudents(parseInt(examId));
      setAssignedStudents(assigned);
      toast.success(t('exams.studentUnassigned'));
    } catch (err) {
      console.error('Error unassigning student:', err);
      toast.error(t('exams.unassignError'));
    }
  };

  // Handle batch assignment
  const handleBatchAssign = async studentIds => {
    try {
      // In a real app, this would be a single API call
      for (const studentId of studentIds) {
        await mockExamService.assignStudent(parseInt(examId), studentId);
      }
      // Update assigned students list
      const assigned = await mockExamService.getAssignedStudents(parseInt(examId));
      setAssignedStudents(assigned);
      toast.success(t('exams.studentsAssigned', { count: studentIds.length }));
    } catch (err) {
      console.error('Error batch assigning students:', err);
      toast.error(t('exams.batchAssignError'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <ErrorDisplay
        title={t('exams.examNotFoundTitle')}
        message={error || t('exams.examNotFound')}
        backLink="/exams"
        backText={t('common.backToExams')}
        onRetry={() => {
          const fetchData = async () => {
            try {
              setLoading(true);
              setError('');
              // Fetch exam details
              const examData = await mockExamService.getExamById(parseInt(examId));
              setExam(examData);

              // Fetch all students
              const allStudents = await mockStudentService.getAllStudents();
              setStudents(allStudents);

              // Fetch assigned students
              const assigned = await mockExamService.getAssignedStudents(parseInt(examId));
              setAssignedStudents(assigned);
            } catch (err) {
              console.error('Error fetching data:', err);
              setError(t('exams.fetchError'));
              toast.error(t('exams.fetchError'));
            } finally {
              setLoading(false);
            }
          };

          fetchData();
        }}
        showRetry={true}
        variant="error"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('exams.manageStudents')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {exam?.title} - {exam?.date ? new Date(exam.date).toLocaleDateString() : ''}
          </p>
        </div>
        <button
          onClick={() => navigate(`/exams/${examId}`)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {t('common.backToExam')}
        </button>
      </div>

      {/* Enhanced Student Assignment Component */}
      <EnhancedStudentAssignment
        students={students}
        assignedStudents={assignedStudents}
        onAssign={handleAssignStudent}
        onUnassign={handleUnassignStudent}
        onBatchAssign={handleBatchAssign}
      />
    </div>
  );
};

export default EnhancedStudentAssignmentPage;
