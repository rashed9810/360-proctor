import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

/**
 * Exam details view component
 * @param {Object} props - Component props
 * @param {Object} props.exam - Exam data
 */
const ExamDetailsView = ({ exam }) => {
  const { t, i18n } = useTranslation(['exams', 'translation']);
  const [activeTab, setActiveTab] = useState('overview');

  if (!exam) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {exam.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {exam.subject}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Link
            to={`/exams/${exam.id}/edit`}
            className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t('common.edit', { ns: 'translation' })}
          </Link>
          <button
            className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('common.delete', { ns: 'translation' })}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {new Date(exam.startTime).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : undefined)}
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          {new Date(exam.startTime).toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : undefined)} - {new Date(exam.endTime).toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : undefined)}
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
          {t('trustScoreThreshold')}: {exam.trustScoreThreshold}%
        </div>
        <div className="flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-1" />
          {t(`common.${exam.status}`, { ns: 'translation' })}
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
            {t('overview')}
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
            {t('monitoring')}
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
            {t('students')}
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
            {t('scheduling')}
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t('examDetails')}
              </h2>
              
              {exam.description && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('description')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {exam.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('schedule')}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('startDate')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(exam.startTime).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : undefined)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('startTime')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(exam.startTime).toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : undefined)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('endDate')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(exam.endTime).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : undefined)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('endTime')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(exam.endTime).toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : undefined)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('duration')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.duration} {t('common.minutes', { ns: 'translation' })}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('proctoringSettings')}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('faceDetection')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.enableFaceDetection ? t('common.yes', { ns: 'translation' }) : t('common.no', { ns: 'translation' })}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('multipleFaceDetection')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.enableMultipleFaceDetection ? t('common.yes', { ns: 'translation' }) : t('common.no', { ns: 'translation' })}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('eyeTracking')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.enableEyeTracking ? t('common.yes', { ns: 'translation' }) : t('common.no', { ns: 'translation' })}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('audioDetection')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.enableAudioDetection ? t('common.yes', { ns: 'translation' }) : t('common.no', { ns: 'translation' })}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tabSwitchingDetection')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{exam.enableTabSwitchDetection ? t('common.yes', { ns: 'translation' }) : t('common.no', { ns: 'translation' })}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExamDetailsView;
