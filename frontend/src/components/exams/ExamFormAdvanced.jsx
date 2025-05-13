import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  UserGroupIcon,
  SpeakerWaveIcon,
  WindowIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

/**
 * Advanced settings section for the exam form
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.onChange - Function to handle form changes
 * @param {Object} props.errors - Form validation errors
 */
const ExamFormAdvanced = ({ formData, onChange, errors = {} }) => {
  const { t } = useTranslation('exams');
  const [isOpen, setIsOpen] = useState(false);

  // Handle form input changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    onChange({
      target: {
        name,
        value: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        type,
      },
    });
  };

  return (
    <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 text-left"
      >
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {t('exams.advancedSettings')}
          </h3>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-white dark:bg-gray-800"
        >
          {/* Proctoring Settings */}
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
              {t('exams.proctoringSettings')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Face Detection */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableFaceDetection"
                  name="enableFaceDetection"
                  checked={formData.enableFaceDetection}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enableFaceDetection"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enableFaceDetection')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enableFaceDetectionHelp')}
                  </p>
                </div>
              </div>

              {/* Multiple Face Detection */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableMultipleFaceDetection"
                  name="enableMultipleFaceDetection"
                  checked={formData.enableMultipleFaceDetection}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enableMultipleFaceDetection"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enableMultipleFaceDetection')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enableMultipleFaceDetectionHelp')}
                  </p>
                </div>
              </div>

              {/* Eye Tracking */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableEyeTracking"
                  name="enableEyeTracking"
                  checked={formData.enableEyeTracking}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enableEyeTracking"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enableEyeTracking')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enableEyeTrackingHelp')}
                  </p>
                </div>
              </div>

              {/* Audio Detection */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAudioDetection"
                  name="enableAudioDetection"
                  checked={formData.enableAudioDetection}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enableAudioDetection"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <SpeakerWaveIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enableAudioDetection')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enableAudioDetectionHelp')}
                  </p>
                </div>
              </div>

              {/* Tab Switch Detection */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableTabSwitchDetection"
                  name="enableTabSwitchDetection"
                  checked={formData.enableTabSwitchDetection}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enableTabSwitchDetection"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <WindowIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enableTabSwitchDetection')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enableTabSwitchDetectionHelp')}
                  </p>
                </div>
              </div>

              {/* Phone Detection */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enablePhoneDetection"
                  name="enablePhoneDetection"
                  checked={formData.enablePhoneDetection}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="enablePhoneDetection"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <DevicePhoneMobileIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {t('exams.enablePhoneDetection')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.enablePhoneDetectionHelp')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Score Thresholds */}
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {t('exams.trustScoreThresholds')}
            </h4>

            {/* Warning Threshold */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="warningThreshold"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('exams.warningThreshold')}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.warningThreshold}%
                </span>
              </div>
              <input
                type="range"
                id="warningThreshold"
                name="warningThreshold"
                min="50"
                max="90"
                step="5"
                value={formData.warningThreshold}
                onChange={handleChange}
                className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              {errors.warningThreshold && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.warningThreshold}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('exams.warningThresholdHelp')}
              </p>
            </div>

            {/* Critical Threshold */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="criticalThreshold"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('exams.criticalThreshold')}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.criticalThreshold}%
                </span>
              </div>
              <input
                type="range"
                id="criticalThreshold"
                name="criticalThreshold"
                min="30"
                max="70"
                step="5"
                value={formData.criticalThreshold}
                onChange={handleChange}
                className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('exams.criticalThresholdHelp')}
              </p>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {t('exams.additionalSettings')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allow Late Submission */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowLateSubmission"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="allowLateSubmission"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('exams.allowLateSubmission')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.allowLateSubmissionHelp')}
                  </p>
                </div>
              </div>

              {/* Show Results */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="showResults"
                  name="showResults"
                  checked={formData.showResults}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="showResults"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('exams.showResults')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exams.showResultsHelp')}
                  </p>
                </div>
              </div>
            </div>

            {/* Passing Score */}
            <div>
              <label
                htmlFor="passingScore"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('exams.passingScore')} (%)
              </label>
              <input
                type="number"
                id="passingScore"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('exams.passingScoreHelp')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExamFormAdvanced;
