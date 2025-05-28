import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon,
  LockClosedIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

/**
 * Exam Settings Component
 * Comprehensive settings for exam configuration
 */
const ExamSettings = ({ settings, onSettingsChange, className = '' }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('access');

  const sections = [
    {
      id: 'access',
      title: t('exams.settings.accessControl', 'Access Control'),
      icon: LockClosedIcon,
      description: t('exams.settings.accessControlDesc', 'Control who can access the exam'),
    },
    {
      id: 'proctoring',
      title: t('exams.settings.proctoring', 'Proctoring'),
      icon: ShieldCheckIcon,
      description: t('exams.settings.proctoringDesc', 'Configure monitoring and security'),
    },
    {
      id: 'display',
      title: t('exams.settings.display', 'Display'),
      icon: EyeIcon,
      description: t('exams.settings.displayDesc', 'Customize how questions are shown'),
    },
    {
      id: 'grading',
      title: t('exams.settings.grading', 'Grading'),
      icon: ChartBarIcon,
      description: t('exams.settings.gradingDesc', 'Set grading rules and scoring'),
    },
    {
      id: 'security',
      title: t('exams.settings.security', 'Security'),
      icon: ShieldCheckIcon,
      description: t('exams.settings.securityDesc', 'Additional security measures'),
    },
  ];

  const handleSettingChange = (key, value) => {
    onSettingsChange(key, value);
  };

  const renderAccessControl = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('exams.settings.accessCode', 'Access Code')} ({t('common.optional', 'Optional')})
        </label>
        <input
          type="text"
          value={settings.accessCode || ''}
          onChange={e => handleSettingChange('accessCode', e.target.value)}
          placeholder={t('exams.settings.accessCodePlaceholder', 'Enter access code...')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('exams.settings.accessCodeHelp', 'Students will need this code to access the exam')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('exams.settings.maxAttempts', 'Maximum Attempts')}
        </label>
        <select
          value={settings.maxAttempts || 1}
          onChange={e => handleSettingChange('maxAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
        >
          <option value={1}>1 {t('exams.settings.attempt', 'attempt')}</option>
          <option value={2}>2 {t('exams.settings.attempts', 'attempts')}</option>
          <option value={3}>3 {t('exams.settings.attempts', 'attempts')}</option>
          <option value={5}>5 {t('exams.settings.attempts', 'attempts')}</option>
          <option value={-1}>{t('exams.settings.unlimited', 'Unlimited')}</option>
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="allowLateSubmission"
          checked={settings.allowLateSubmission || false}
          onChange={e => handleSettingChange('allowLateSubmission', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="allowLateSubmission" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.allowLateSubmission', 'Allow Late Submission')}
        </label>
      </div>

      {settings.allowLateSubmission && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-7"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('exams.settings.lateSubmissionPenalty', 'Late Submission Penalty')} (%)
          </label>
          <input
            type="number"
            value={settings.lateSubmissionPenalty || 0}
            onChange={e =>
              handleSettingChange('lateSubmissionPenalty', parseInt(e.target.value) || 0)
            }
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
        </motion.div>
      )}
    </div>
  );

  const renderProctoring = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="enableProctoring"
          checked={settings.enableProctoring !== false}
          onChange={e => handleSettingChange('enableProctoring', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableProctoring" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.enableProctoring', 'Enable Proctoring')}
        </label>
      </div>

      {settings.enableProctoring !== false && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 ml-7"
        >
          <div className="flex items-center space-x-3">
            <VideoCameraIcon className="h-4 w-4 text-blue-500" />
            <input
              type="checkbox"
              id="enableFaceDetection"
              checked={settings.enableFaceDetection !== false}
              onChange={e => handleSettingChange('enableFaceDetection', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enableFaceDetection"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {t('exams.settings.enableFaceDetection', 'Face Detection')}
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <SpeakerWaveIcon className="h-4 w-4 text-green-500" />
            <input
              type="checkbox"
              id="enableAudioMonitoring"
              checked={settings.enableAudioMonitoring !== false}
              onChange={e => handleSettingChange('enableAudioMonitoring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enableAudioMonitoring"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {t('exams.settings.enableAudioMonitoring', 'Audio Monitoring')}
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <ComputerDesktopIcon className="h-4 w-4 text-purple-500" />
            <input
              type="checkbox"
              id="enableScreenRecording"
              checked={settings.enableScreenRecording || false}
              onChange={e => handleSettingChange('enableScreenRecording', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enableScreenRecording"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {t('exams.settings.enableScreenRecording', 'Screen Recording')}
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-4 w-4 text-orange-500" />
            <input
              type="checkbox"
              id="allowTabSwitching"
              checked={settings.allowTabSwitching || false}
              onChange={e => handleSettingChange('allowTabSwitching', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowTabSwitching" className="text-sm text-gray-700 dark:text-gray-300">
              {t('exams.settings.allowTabSwitching', 'Allow Tab Switching')}
            </label>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderDisplay = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="randomizeQuestions"
          checked={settings.randomizeQuestions || false}
          onChange={e => handleSettingChange('randomizeQuestions', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="randomizeQuestions" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.randomizeQuestions', 'Randomize Question Order')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="randomizeOptions"
          checked={settings.randomizeOptions || false}
          onChange={e => handleSettingChange('randomizeOptions', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="randomizeOptions" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.randomizeOptions', 'Randomize Answer Options')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="showProgressBar"
          checked={settings.showProgressBar !== false}
          onChange={e => handleSettingChange('showProgressBar', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showProgressBar" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.showProgressBar', 'Show Progress Bar')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="allowBackNavigation"
          checked={settings.allowBackNavigation !== false}
          onChange={e => handleSettingChange('allowBackNavigation', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="allowBackNavigation" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.allowBackNavigation', 'Allow Back Navigation')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="showQuestionNumbers"
          checked={settings.showQuestionNumbers !== false}
          onChange={e => handleSettingChange('showQuestionNumbers', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showQuestionNumbers" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.showQuestionNumbers', 'Show Question Numbers')}
        </label>
      </div>
    </div>
  );

  const renderGrading = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="autoGrade"
          checked={settings.autoGrade !== false}
          onChange={e => handleSettingChange('autoGrade', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoGrade" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.autoGrade', 'Automatic Grading')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="showResultsImmediately"
          checked={settings.showResultsImmediately || false}
          onChange={e => handleSettingChange('showResultsImmediately', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="showResultsImmediately"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          {t('exams.settings.showResultsImmediately', 'Show Results Immediately')}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('exams.settings.passingScore', 'Passing Score')} (%)
        </label>
        <input
          type="number"
          value={settings.passingScore || 70}
          onChange={e => handleSettingChange('passingScore', parseInt(e.target.value) || 70)}
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('exams.settings.gradingMethod', 'Grading Method')}
        </label>
        <select
          value={settings.gradingMethod || 'points'}
          onChange={e => handleSettingChange('gradingMethod', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="points">{t('exams.settings.points', 'Points Based')}</option>
          <option value="percentage">{t('exams.settings.percentage', 'Percentage Based')}</option>
        </select>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="preventCopyPaste"
          checked={settings.preventCopyPaste !== false}
          onChange={e => handleSettingChange('preventCopyPaste', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="preventCopyPaste" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.preventCopyPaste', 'Prevent Copy/Paste')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="disableRightClick"
          checked={settings.disableRightClick !== false}
          onChange={e => handleSettingChange('disableRightClick', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="disableRightClick" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.disableRightClick', 'Disable Right Click')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="fullScreenMode"
          checked={settings.fullScreenMode !== false}
          onChange={e => handleSettingChange('fullScreenMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="fullScreenMode" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.fullScreenMode', 'Force Full Screen Mode')}
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="blockExternalSites"
          checked={settings.blockExternalSites !== false}
          onChange={e => handleSettingChange('blockExternalSites', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="blockExternalSites" className="text-sm text-gray-700 dark:text-gray-300">
          {t('exams.settings.blockExternalSites', 'Block External Sites')}
        </label>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'access':
        return renderAccessControl();
      case 'proctoring':
        return renderProctoring();
      case 'display':
        return renderDisplay();
      case 'grading':
        return renderGrading();
      case 'security':
        return renderSecurity();
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {sections.map(section => {
          const IconComponent = section.icon;
          const isActive = activeSection === section.id;

          return (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent
                  className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                />
                <h3
                  className={`text-sm font-medium ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  {section.title}
                </h3>
              </div>
              <p
                className={`text-xs ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {section.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Section Content */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(sections.find(s => s.id === activeSection)?.icon, {
              className: 'h-5 w-5',
            })}
            <span>{sections.find(s => s.id === activeSection)?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSettings;
