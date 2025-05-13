import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Exam creation and editing form component
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial exam data for editing (optional)
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Function} props.onCancel - Function to handle cancellation
 * @param {boolean} props.isLoading - Whether the form is in loading state
 */
const ExamForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation(['exams', 'validation']);
  const isEditMode = !!initialData;

  // Form state
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
    ...initialData,
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  // Validate form whenever data changes
  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [formData, formTouched]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = t('required', { ns: 'validation' });
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('required', { ns: 'validation' });
    }

    if (!formData.startDate) {
      newErrors.startDate = t('required', { ns: 'validation' });
    }

    if (!formData.startTime) {
      newErrors.startTime = t('required', { ns: 'validation' });
    }

    if (!formData.endDate) {
      newErrors.endDate = t('required', { ns: 'validation' });
    }

    if (!formData.endTime) {
      newErrors.endTime = t('required', { ns: 'validation' });
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = t('required', { ns: 'validation' });
    } else if (formData.duration < 5) {
      newErrors.duration = t('validation.durationMin', { ns: 'exams' });
    } else if (formData.duration > 360) {
      newErrors.duration = t('validation.durationMax', { ns: 'exams' });
    }

    // Date/time validation
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '00:00'}`);

      if (startDateTime >= endDateTime) {
        newErrors.endDate = t('validation.endDateAfterStart', { ns: 'exams' });
      }

      // Check if start date is in the past
      if (startDateTime < new Date()) {
        newErrors.startDate = t('validation.startDateInPast', { ns: 'exams' });
      }
    }

    // Threshold validation
    if (formData.warningThreshold <= formData.criticalThreshold) {
      newErrors.warningThreshold = t('validation.warningThresholdHigher', { ns: 'exams' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));

    if (!formTouched) {
      setFormTouched(true);
    }
  };

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('formErrors', { ns: 'validation' }));
      return;
    }

    // Format data for submission
    const formattedData = {
      ...formData,
      startTime: `${formData.startDate}T${formData.startTime}:00`,
      endTime: `${formData.endDate}T${formData.endTime}:00`,
      warningThreshold: formData.warningThreshold / 100,
      criticalThreshold: formData.criticalThreshold / 100,
    };

    onSubmit(formattedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {isEditMode ? t('exams.editExam') : t('exams.createExam')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {t('exams.basicInfo')}
          </h3>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('exams.title')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
              } dark:bg-gray-700 dark:text-white`}
              placeholder={t('exams.titlePlaceholder')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('exams.subject')} *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.subject
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
              } dark:bg-gray-700 dark:text-white`}
              placeholder={t('exams.subjectPlaceholder')}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('exams.description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder={t('exams.descriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {t('exams.schedule')}
          </h3>

          {/* Start Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.startDate')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-10 rounded-md shadow-sm sm:text-sm ${
                    errors.startDate
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.startTime')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-10 rounded-md shadow-sm sm:text-sm ${
                    errors.startTime
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* End Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.endDate')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-10 rounded-md shadow-sm sm:text-sm ${
                    errors.endDate
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.endTime')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-10 rounded-md shadow-sm sm:text-sm ${
                    errors.endTime
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('exams.duration')} (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="5"
              max="360"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.duration
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('exams.durationHelp')}
            </p>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {t('cancel', { ns: 'common' })}
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading
              ? t('saving', { ns: 'common' })
              : isEditMode
                ? t('update', { ns: 'common' })
                : t('create', { ns: 'common' })}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ExamForm;
