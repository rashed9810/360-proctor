import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ExamForm from '../../components/exams/ExamForm';
import ExamFormAdvanced from '../../components/exams/ExamFormAdvanced';
import { examService } from '../../api';
import { useAuth } from '../../context/AuthContext';

/**
 * Create Exam page component
 */
const CreateExam = () => {
  const { t } = useTranslation(['exams', 'common']);
  const { canManageExams } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: 60,
    // Proctoring settings
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: true,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    // Trust score thresholds
    warningThreshold: 70,
    criticalThreshold: 50,
    // Additional settings
    allowLateSubmission: false,
    showResults: true,
    passingScore: 60,
  });

  // Handle form changes
  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  /**
   * Handle form submission
   * @param {Object} formattedData - Formatted exam data
   */
  const handleSubmit = async formattedData => {
    // Check permissions
    if (!canManageExams()) {
      toast.error(t('common.insufficientPermissions'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await examService.createExam(formattedData);

      if (response.success) {
        toast.success(response.message || t('exams.createSuccess'));
        navigate('/exams');
      } else {
        setError(response.message);
        toast.error(response.message || t('exams.createError'));
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      setError('Failed to create exam');
      toast.error(t('exams.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate('/exams');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/exams')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{t('back', { ns: 'common' })}</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('exams.createExam')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('exams.createExamDescription')}</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <ExamForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />

          {/* Advanced Settings */}
          <div className="mt-6">
            <ExamFormAdvanced formData={formData} onChange={handleFormChange} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {t('exams.helpAndTips')}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('exams.examTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exams.examTitleHelp')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('exams.scheduling')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exams.schedulingHelp')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('exams.proctoring')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exams.proctoringHelp')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('exams.trustScores')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exams.trustScoresHelp')}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('exams.nextSteps')}
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t('exams.nextStepsAssignStudents')}</li>
                <li>{t('exams.nextStepsAddQuestions')}</li>
                <li>{t('exams.nextStepsPreview')}</li>
                <li>{t('exams.nextStepsPublish')}</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
