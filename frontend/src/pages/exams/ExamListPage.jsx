import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ExamList from '../../components/exams/ExamList';
import { examService } from '../../api';

/**
 * Exam list page component with real API integration
 */
const ExamListPage = () => {
  const { t } = useTranslation();
  const { user, canManageExams } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  /**
   * Fetch exams from API
   */
  const fetchExams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await examService.getAllExams({ limit: 1000 });

      if (response.success) {
        // Transform backend data to frontend format
        const transformedExams = response.data.map(exam =>
          examService.transformToFrontendFormat(exam)
        );
        setExams(transformedExams);
      } else {
        setError(response.message);
        toast.error(response.message || t('common.errorFetchingData'));
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to fetch exams');
      toast.error(t('common.errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exam deletion
  const handleDelete = async id => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        const response = await examService.deleteExam(id);

        if (!response.success) {
          toast.error(response.message || t('exams.deleteError'));
          return;
        }
        setExams(prevExams => prevExams.filter(exam => exam.id !== id));
        toast.success(t('exams.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error(t('exams.deleteError'));
      }
    }
  };

  // Handle exam duplication
  const handleDuplicate = async id => {
    try {
      const examToDuplicate = exams.find(exam => exam.id === id);
      if (!examToDuplicate) {
        toast.error(t('exams.examNotFound'));
        return;
      }

      const { id: _, ...examData } = examToDuplicate;
      const duplicatedExam = {
        ...examData,
        title: `${examData.title} (${t('common.copy')})`,
      };

      const response = await examService.createExam(duplicatedExam);

      if (response.success) {
        const transformedExam = examService.transformToFrontendFormat(response.data);
        setExams(prevExams => [...prevExams, transformedExam]);
        toast.success(response.message || t('exams.duplicateSuccess'));
      } else {
        toast.error(response.message || t('exams.duplicateError'));
      }
    } catch (error) {
      console.error('Error duplicating exam:', error);
      toast.error(t('exams.duplicateError'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ExamList
        exams={exams}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        isLoading={isLoading}
        onRefresh={fetchExams}
      />
    </div>
  );
};

export default ExamListPage;
