import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import mockExamService from '../services/mockExams';
import ExamList from '../components/exams/ExamList';
import ErrorDisplay from '../components/common/ErrorDisplay';

export default function Exams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await mockExamService.getAllExams();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError(t('exams.fetchError'));
      toast.error(t('common.errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exam deletion
  const handleDelete = async id => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await mockExamService.deleteExam(id);
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
        title: `${examData.title || examData.name} (${t('common.copy')})`,
      };

      const newExam = await mockExamService.addExam(duplicatedExam);
      setExams(prevExams => [...prevExams, newExam]);
      toast.success(t('exams.duplicateSuccess'));
    } catch (error) {
      console.error('Error duplicating exam:', error);
      toast.error(t('exams.duplicateError'));
    }
  };

  if (isLoading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 animate-spin mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error && exams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay
          title={t('exams.fetchErrorTitle')}
          message={error}
          backLink="/"
          backText={t('common.backToDashboard')}
          onRetry={fetchExams}
          showRetry={true}
          variant="error"
        />
      </div>
    );
  }

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
}
