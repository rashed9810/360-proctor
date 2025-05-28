import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

/**
 * Exam Preview Component
 * Shows a comprehensive preview of the exam before publishing
 */
const ExamPreview = ({ examData, className = '' }) => {
  const { t } = useTranslation();
  const [previewMode, setPreviewMode] = useState('summary'); // 'summary' or 'student'

  /**
   * Get question type display name
   */
  const getQuestionTypeDisplay = type => {
    const typeMap = {
      multiple_choice: t('exams.multipleChoice', 'Multiple Choice'),
      multiple_select: t('exams.multipleSelect', 'Multiple Select'),
      true_false: t('exams.trueFalse', 'True/False'),
      short_answer: t('exams.shortAnswer', 'Short Answer'),
      essay: t('exams.essay', 'Essay'),
    };
    return typeMap[type] || type;
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = difficulty => {
    const colorMap = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red',
    };
    return colorMap[difficulty] || 'gray';
  };

  /**
   * Format date for display
   */
  const formatDate = dateString => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  /**
   * Render exam summary
   */
  const renderSummary = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>{t('exams.basicInformation', 'Basic Information')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {examData.title || t('exams.untitledExam', 'Untitled Exam')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {examData.description || t('exams.noDescription', 'No description provided')}
              </p>
              {examData.instructions && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('exams.instructions', 'Instructions')}:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {examData.instructions}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TagIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exams.category', 'Category')}: {examData.category}
                </span>
              </div>
              {examData.tags && examData.tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <TagIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('exams.tags', 'Tags')}:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {examData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>{t('exams.schedule', 'Schedule')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('exams.startDate', 'Start Date')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(examData.startDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('exams.endDate', 'End Date')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(examData.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('exams.duration', 'Duration')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {examData.duration} {t('common.minutes', 'minutes')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Summary */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>
              {t('exams.questions', 'Questions')} ({examData.totalQuestions})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {examData.totalQuestions}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('exams.totalQuestions', 'Total Questions')}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <SparklesIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {examData.totalPoints}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('exams.totalPoints', 'Total Points')}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <StarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {examData.totalPoints > 0
                  ? Math.round((examData.totalPoints / examData.totalQuestions) * 10) / 10
                  : 0}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('exams.avgPointsPerQuestion', 'Avg Points/Question')}
              </p>
            </div>
          </div>

          {examData.questions && examData.questions.length > 0 ? (
            <div className="space-y-3">
              {examData.questions.map((question, index) => {
                const difficultyColor = getDifficultyColor(question.difficulty);
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Q{index + 1}
                      </span>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-md">
                        {question.title || t('exams.untitledQuestion', 'Untitled Question')}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getQuestionTypeDisplay(question.type)}
                      </span>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${difficultyColor}-100 text-${difficultyColor}-800 dark:bg-${difficultyColor}-900/20 dark:text-${difficultyColor}-400`}
                      >
                        {question.difficulty} ({question.points}pts)
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('exams.noQuestionsAdded', 'No questions added yet')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>{t('exams.settings', 'Settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Access Control */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('exams.settings.accessControl', 'Access Control')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.accessCode', 'Access Code')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {examData.settings?.accessCode || t('common.none', 'None')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.maxAttempts', 'Max Attempts')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {examData.settings?.maxAttempts === -1
                      ? t('exams.settings.unlimited', 'Unlimited')
                      : examData.settings?.maxAttempts || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Proctoring */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('exams.settings.proctoring', 'Proctoring')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {examData.settings?.enableProctoring !== false ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.enableProctoring', 'Enable Proctoring')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {examData.settings?.enableFaceDetection !== false ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.enableFaceDetection', 'Face Detection')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {examData.settings?.enableAudioMonitoring !== false ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.enableAudioMonitoring', 'Audio Monitoring')}
                  </span>
                </div>
              </div>
            </div>

            {/* Grading */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('exams.settings.grading', 'Grading')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.passingScore', 'Passing Score')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {examData.settings?.passingScore || 70}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {examData.settings?.autoGrade !== false ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.autoGrade', 'Auto Grade')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {examData.settings?.showResultsImmediately ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('exams.settings.showResultsImmediately', 'Immediate Results')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Assignment */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5" />
            <span>
              {t('exams.students', 'Students')} ({examData.assignedStudents?.length || 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {examData.assignedStudents && examData.assignedStudents.length > 0 ? (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {examData.assignedStudents.length}{' '}
                {t('exams.studentsAssigned', 'students assigned')}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                {t('exams.noStudentsAssigned', 'No students assigned yet')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t(
                  'exams.assignStudentsBeforePublishing',
                  'Assign students before publishing the exam'
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Render student view preview
   */
  const renderStudentView = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <EyeIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('exams.studentViewPreview', 'Student View Preview')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('exams.studentViewPreviewDesc', 'Student view preview will be available soon')}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview Mode Toggle */}
      <div className="flex items-center justify-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setPreviewMode('summary')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            previewMode === 'summary'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {t('exams.summary', 'Summary')}
        </button>
        <button
          onClick={() => setPreviewMode('student')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            previewMode === 'student'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {t('exams.studentView', 'Student View')}
        </button>
      </div>

      {/* Preview Content */}
      <motion.div
        key={previewMode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {previewMode === 'summary' ? renderSummary() : renderStudentView()}
      </motion.div>
    </div>
  );
};

export default ExamPreview;
