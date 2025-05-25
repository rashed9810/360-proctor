import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  EyeIcon,
  SaveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import QuestionBuilder from './QuestionBuilder';
import QuestionBank from './QuestionBank';
import ExamScheduler from './ExamScheduler';
import ExamSettings from './ExamSettings';
import ExamPreview from './ExamPreview';
import toast from 'react-hot-toast';

/**
 * Enhanced Exam Creation Component
 * Comprehensive exam creation with question builder, scheduling, and settings
 */
const EnhancedExamCreation = ({ examId = null, className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Exam data state
  const [examData, setExamData] = useState({
    // Basic Information
    title: '',
    description: '',
    instructions: '',
    category: 'general',
    tags: [],

    // Questions
    questions: [],
    totalQuestions: 0,
    totalPoints: 0,

    // Scheduling
    startDate: '',
    endDate: '',
    duration: 60, // minutes
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Settings
    settings: {
      // Access Control
      accessCode: '',
      allowLateSubmission: false,
      lateSubmissionPenalty: 0,
      maxAttempts: 1,

      // Proctoring
      enableProctoring: true,
      enableFaceDetection: true,
      enableAudioMonitoring: true,
      enableScreenRecording: false,
      allowTabSwitching: false,

      // Question Display
      randomizeQuestions: false,
      randomizeOptions: false,
      showProgressBar: true,
      allowBackNavigation: true,
      showQuestionNumbers: true,

      // Grading
      autoGrade: true,
      showResultsImmediately: false,
      passingScore: 70,
      gradingMethod: 'points', // 'points' or 'percentage'

      // Security
      preventCopyPaste: true,
      disableRightClick: true,
      fullScreenMode: true,
      blockExternalSites: true,
    },

    // Students
    assignedStudents: [],
    studentGroups: [],

    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft', // 'draft', 'scheduled', 'active', 'completed'
  });

  // Categories for questions
  const [categories, setCategories] = useState([
    { id: 'general', name: 'General', description: 'General questions' },
    { id: 'mathematics', name: 'Mathematics', description: 'Math-related questions' },
    { id: 'science', name: 'Science', description: 'Science questions' },
    { id: 'literature', name: 'Literature', description: 'Literature questions' },
    { id: 'history', name: 'History', description: 'History questions' },
  ]);

  // Question bank for selection
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Steps configuration
  const steps = [
    {
      id: 'basic',
      title: t('exams.basicInformation', 'Basic Information'),
      description: t('exams.basicInformationDesc', 'Set up exam title, description, and category'),
      icon: DocumentTextIcon,
      component: 'BasicInformation',
    },
    {
      id: 'questions',
      title: t('exams.questions', 'Questions'),
      description: t('exams.questionsDesc', 'Add and manage exam questions'),
      icon: DocumentTextIcon,
      component: 'Questions',
    },
    {
      id: 'schedule',
      title: t('exams.schedule', 'Schedule'),
      description: t('exams.scheduleDesc', 'Set exam dates, times, and duration'),
      icon: CalendarIcon,
      component: 'Schedule',
    },
    {
      id: 'settings',
      title: t('exams.settings', 'Settings'),
      description: t('exams.settingsDesc', 'Configure exam behavior and security'),
      icon: Cog6ToothIcon,
      component: 'Settings',
    },
    {
      id: 'students',
      title: t('exams.students', 'Students'),
      description: t('exams.studentsDesc', 'Assign students and groups'),
      icon: UserGroupIcon,
      component: 'Students',
    },
    {
      id: 'preview',
      title: t('exams.preview', 'Preview'),
      description: t('exams.previewDesc', 'Review and finalize exam'),
      icon: EyeIcon,
      component: 'Preview',
    },
  ];

  // Load exam data if editing
  useEffect(() => {
    if (examId) {
      loadExamData(examId);
    }
  }, [examId]);

  // Update calculated fields when questions change
  useEffect(() => {
    const totalQuestions = examData.questions.length;
    const totalPoints = examData.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    setExamData(prev => ({
      ...prev,
      totalQuestions,
      totalPoints,
      updatedAt: new Date().toISOString(),
    }));
  }, [examData.questions]);

  /**
   * Load exam data for editing
   */
  const loadExamData = async id => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data for demonstration
      const mockExamData = {
        ...examData,
        title: 'Sample Exam',
        description: 'This is a sample exam for demonstration',
        questions: [],
      };

      setExamData(mockExamData);
    } catch (error) {
      console.error('Error loading exam:', error);
      toast.error(t('exams.loadError', 'Failed to load exam'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle field changes
   */
  const handleFieldChange = useCallback(
    (field, value) => {
      setExamData(prev => ({
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString(),
      }));

      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null,
        }));
      }
    },
    [errors]
  );

  /**
   * Handle settings changes
   */
  const handleSettingsChange = useCallback((settingKey, value) => {
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingKey]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  /**
   * Handle questions changes
   */
  const handleQuestionsChange = useCallback(questions => {
    setExamData(prev => ({
      ...prev,
      questions,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  /**
   * Validate current step
   */
  const validateStep = useCallback(
    stepIndex => {
      const step = steps[stepIndex];
      const newErrors = {};

      switch (step.id) {
        case 'basic':
          if (!examData.title?.trim()) {
            newErrors.title = t('validation.required', 'This field is required');
          }
          if (!examData.description?.trim()) {
            newErrors.description = t('validation.required', 'This field is required');
          }
          break;

        case 'questions':
          if (examData.questions.length === 0) {
            newErrors.questions = t(
              'exams.validation.questionsRequired',
              'At least one question is required'
            );
          }
          break;

        case 'schedule':
          if (!examData.startDate) {
            newErrors.startDate = t('validation.required', 'This field is required');
          }
          if (!examData.endDate) {
            newErrors.endDate = t('validation.required', 'This field is required');
          }
          if (
            examData.startDate &&
            examData.endDate &&
            new Date(examData.startDate) >= new Date(examData.endDate)
          ) {
            newErrors.endDate = t(
              'exams.validation.endDateAfterStart',
              'End date must be after start date'
            );
          }
          if (!examData.duration || examData.duration < 1) {
            newErrors.duration = t(
              'exams.validation.durationRequired',
              'Duration must be at least 1 minute'
            );
          }
          break;

        case 'students':
          if (examData.assignedStudents.length === 0 && examData.studentGroups.length === 0) {
            newErrors.students = t(
              'exams.validation.studentsRequired',
              'At least one student or group must be assigned'
            );
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [examData, steps, t]
  );

  /**
   * Navigate to next step
   */
  const handleNextStep = useCallback(() => {
    if (validateStep(activeStep)) {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      }
    } else {
      toast.error(t('validation.formErrors', 'Please fix the errors in the form'));
    }
  }, [activeStep, steps.length, validateStep, t]);

  /**
   * Navigate to previous step
   */
  const handlePreviousStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  /**
   * Save exam as draft
   */
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('exams.draftSaved', 'Draft saved successfully'));
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(t('exams.saveError', 'Failed to save draft'));
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  /**
   * Publish exam
   */
  const handlePublishExam = useCallback(async () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setActiveStep(i);
        break;
      }
    }

    if (!allValid) {
      toast.error(t('exams.validation.fixErrors', 'Please fix all errors before publishing'));
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedExamData = {
        ...examData,
        status: 'scheduled',
        updatedAt: new Date().toISOString(),
      };

      toast.success(t('exams.publishSuccess', 'Exam published successfully'));
      navigate('/exams/list');
    } catch (error) {
      console.error('Error publishing exam:', error);
      toast.error(t('exams.publishError', 'Failed to publish exam'));
    } finally {
      setIsSaving(false);
    }
  }, [examData, steps, validateStep, t, navigate]);

  /**
   * Get step status
   */
  const getStepStatus = useCallback(
    stepIndex => {
      if (stepIndex < activeStep) {
        return validateStep(stepIndex) ? 'completed' : 'error';
      } else if (stepIndex === activeStep) {
        return 'active';
      } else {
        return 'pending';
      }
    },
    [activeStep, validateStep]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/exams/list')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  {examId ? t('exams.editExam', 'Edit Exam') : t('exams.createExam', 'Create Exam')}
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-2"
                  >
                    <SparklesIcon className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {examData.title || t('exams.newExam', 'New Exam')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                <span>{t('exams.saveDraft', 'Save Draft')}</span>
              </Button>

              {activeStep === steps.length - 1 && (
                <Button
                  variant="primary"
                  onClick={handlePublishExam}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>{t('exams.publishExam', 'Publish Exam')}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {examData.totalQuestions} {t('exams.questions', 'questions')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {examData.totalPoints} {t('exams.points', 'points')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {examData.duration} {t('common.minutes', 'minutes')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-4 w-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {examData.assignedStudents.length} {t('exams.students', 'students')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step Navigation */}
      <Card variant="default">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {steps[activeStep].title}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('common.step', 'Step')} {activeStep + 1} {t('common.of', 'of')} {steps.length}
            </span>
          </div>

          {/* Step Progress */}
          <div className="flex items-center space-x-2 mb-8">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const IconComponent = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveStep(index)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : status === 'error'
                          ? 'bg-red-500 border-red-500 text-white'
                          : status === 'active'
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                    }`}
                    title={step.title}
                  >
                    {status === 'completed' ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : status === 'error' ? (
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </motion.button>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        getStepStatus(index + 1) === 'completed' ||
                        getStepStatus(index + 1) === 'error'
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={activeStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{t('common.previous', 'Previous')}</span>
            </Button>

            <div className="flex items-center space-x-3">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {Object.keys(errors).length} {t('validation.errorsFound', 'errors found')}
                  </span>
                </div>
              )}

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  className="flex items-center space-x-2"
                >
                  <span>{t('common.next', 'Next')}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePublishExam}
                  disabled={isSaving || Object.keys(errors).length > 0}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>{t('exams.publishExam', 'Publish Exam')}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Render step content based on active step
   */
  function renderStepContent() {
    const step = steps[activeStep];

    switch (step.component) {
      case 'BasicInformation':
        return renderBasicInformation();
      case 'Questions':
        return renderQuestions();
      case 'Schedule':
        return renderSchedule();
      case 'Settings':
        return renderSettings();
      case 'Students':
        return renderStudents();
      case 'Preview':
        return renderPreview();
      default:
        return <div>Step content not implemented</div>;
    }
  }

  /**
   * Render basic information step
   */
  function renderBasicInformation() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('exams.examTitle', 'Exam Title')} *
          </label>
          <input
            type="text"
            value={examData.title}
            onChange={e => handleFieldChange('title', e.target.value)}
            placeholder={t('exams.examTitlePlaceholder', 'Enter exam title...')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          {errors.title && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('exams.description', 'Description')} *
          </label>
          <textarea
            value={examData.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            placeholder={t(
              'exams.descriptionPlaceholder',
              'Describe the exam purpose and content...'
            )}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('exams.instructions', 'Instructions')} ({t('common.optional', 'Optional')})
          </label>
          <textarea
            value={examData.instructions}
            onChange={e => handleFieldChange('instructions', e.target.value)}
            placeholder={t('exams.instructionsPlaceholder', 'Provide instructions for students...')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.category', 'Category')}
            </label>
            <select
              value={examData.category}
              onChange={e => handleFieldChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.tags', 'Tags')} ({t('common.optional', 'Optional')})
            </label>
            <input
              type="text"
              value={examData.tags.join(', ')}
              onChange={e =>
                handleFieldChange(
                  'tags',
                  e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
                )
              }
              placeholder={t('exams.tagsPlaceholder', 'Enter tags separated by commas...')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render questions step
   */
  function renderQuestions() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('exams.manageQuestions', 'Manage Questions')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t(
                'exams.manageQuestionsDesc',
                'Add questions from the question bank or create new ones'
              )}
            </p>
          </div>
        </div>

        {errors.questions && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.questions}</p>
            </div>
          </div>
        )}

        <QuestionBuilder
          questions={examData.questions}
          onQuestionsChange={handleQuestionsChange}
          categories={categories}
          onCategoriesChange={setCategories}
        />
      </div>
    );
  }

  /**
   * Render schedule step
   */
  function renderSchedule() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('exams.examSchedule', 'Exam Schedule')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.startDate', 'Start Date')} *
            </label>
            <input
              type="datetime-local"
              value={examData.startDate}
              onChange={e => handleFieldChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.endDate', 'End Date')} *
            </label>
            <input
              type="datetime-local"
              value={examData.endDate}
              onChange={e => handleFieldChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.endDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.duration', 'Duration')} ({t('common.minutes', 'minutes')}) *
            </label>
            <input
              type="number"
              value={examData.duration}
              onChange={e => handleFieldChange('duration', parseInt(e.target.value) || 0)}
              min="1"
              max="600"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.duration && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.timeZone', 'Time Zone')}
            </label>
            <select
              value={examData.timeZone}
              onChange={e => handleFieldChange('timeZone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Bangladesh Time (BST)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render settings step
   */
  function renderSettings() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('exams.examSettings', 'Exam Settings')}
          </h3>
        </div>

        <ExamSettings settings={examData.settings} onSettingsChange={handleSettingsChange} />
      </div>
    );
  }

  /**
   * Render students step
   */
  function renderStudents() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('exams.assignStudents', 'Assign Students')}
          </h3>
        </div>

        {errors.students && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.students}</p>
            </div>
          </div>
        )}

        <div className="text-center py-8">
          <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('exams.studentAssignment', 'Student Assignment')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              'exams.studentAssignmentDesc',
              'Student assignment functionality will be available soon'
            )}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render preview step
   */
  function renderPreview() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('exams.examPreview', 'Exam Preview')}
          </h3>
        </div>

        <ExamPreview examData={examData} />
      </div>
    );
  }
};

export default EnhancedExamCreation;
