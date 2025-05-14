import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ExamList from '../../components/exams/ExamList';
import mockExamService from '../../services/mockExams';

/**
 * Exam list page component
 */
const ExamListPage = () => {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  // Fetch exams from API
  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const data = await mockExamService.getAllExams();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error(t('common.errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exam deletion
  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await mockExamService.deleteExam(id);
        setExams((prevExams) => prevExams.filter((exam) => exam.id !== id));
        toast.success(t('exams.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error(t('exams.deleteError'));
      }
    }
  };

  // Handle exam duplication
  const handleDuplicate = async (id) => {
    try {
      const examToDuplicate = exams.find((exam) => exam.id === id);
      if (!examToDuplicate) {
        toast.error(t('exams.examNotFound'));
        return;
      }

      const { id: _, ...examData } = examToDuplicate;
      const duplicatedExam = {
        ...examData,
        title: `${examData.title} (${t('common.copy')})`,
      };

      const newExam = await mockExamService.addExam(duplicatedExam);
      setExams((prevExams) => [...prevExams, newExam]);
      toast.success(t('exams.duplicateSuccess'));
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
