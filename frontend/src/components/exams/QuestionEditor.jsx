import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  TagIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * Question Editor Component
 * Detailed editor for individual questions with all features
 */
const QuestionEditor = ({ question, onSave, onCancel, categories = [], isOpen = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when question changes
  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        options: question.options ? [...question.options] : [],
        tags: question.tags ? [...question.tags] : [],
        media: question.media
          ? { ...question.media }
          : {
              images: [],
              videos: [],
              audio: [],
              documents: [],
            },
      });
    }
  }, [question]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback(
    (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
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
   * Handle option changes
   */
  const handleOptionChange = useCallback((optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === optionId ? { ...option, [field]: value } : option
      ),
    }));
  }, []);

  /**
   * Add new option
   */
  const handleAddOption = useCallback(() => {
    const newOption = {
      id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      isCorrect: false,
    };

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  }, []);

  /**
   * Remove option
   */
  const handleRemoveOption = useCallback(optionId => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId),
    }));
  }, []);

  /**
   * Handle tag management
   */
  const handleAddTag = useCallback(
    tag => {
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
    },
    [formData.tags]
  );

  const handleRemoveTag = useCallback(tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  /**
   * Validate form data
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = t('validation.required', 'This field is required');
    }

    // Points validation
    if (!formData.points || formData.points < 1) {
      newErrors.points = t('exams.validation.pointsRequired', 'Points must be at least 1');
    }

    // Options validation for multiple choice questions
    if (['multiple_choice', 'multiple_select', 'true_false'].includes(formData.type)) {
      if (!formData.options || formData.options.length < 2) {
        newErrors.options = t('exams.validation.minOptions', 'At least 2 options required');
      }

      const correctOptions = formData.options?.filter(opt => opt.isCorrect) || [];
      if (correctOptions.length === 0) {
        newErrors.correctAnswer = t(
          'exams.validation.correctAnswerRequired',
          'At least one correct answer required'
        );
      }

      if (formData.type === 'multiple_choice' && correctOptions.length > 1) {
        newErrors.correctAnswer = t(
          'exams.validation.singleCorrectAnswer',
          'Only one correct answer allowed for multiple choice'
        );
      }
    }

    // Short answer and essay validation
    if (['short_answer', 'essay'].includes(formData.type)) {
      if (!formData.correctAnswer?.trim()) {
        newErrors.correctAnswer = t(
          'exams.validation.correctAnswerRequired',
          'Correct answer is required'
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error(t('validation.formErrors', 'Please fix the errors in the form'));
        return;
      }

      setIsLoading(true);

      try {
        const updatedQuestion = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        await onSave(updatedQuestion);
        toast.success(t('exams.questionSaved', 'Question saved successfully'));
      } catch (error) {
        console.error('Error saving question:', error);
        toast.error(t('exams.questionSaveError', 'Failed to save question'));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, onSave, t]
  );

  /**
   * Render option editor
   */
  const renderOptionEditor = () => {
    if (!['multiple_choice', 'multiple_select', 'true_false'].includes(formData.type)) {
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('exams.answerOptions', 'Answer Options')}
          </h4>
          {formData.type !== 'true_false' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{t('exams.addOption', 'Add Option')}</span>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {formData.options?.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <input
                  type={formData.type === 'multiple_select' ? 'checkbox' : 'radio'}
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={e => {
                    if (formData.type === 'multiple_choice') {
                      // For single choice, uncheck all others
                      setFormData(prev => ({
                        ...prev,
                        options: prev.options.map(opt => ({
                          ...opt,
                          isCorrect: opt.id === option.id ? e.target.checked : false,
                        })),
                      }));
                    } else {
                      handleOptionChange(option.id, 'isCorrect', e.target.checked);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={e => handleOptionChange(option.id, 'text', e.target.value)}
                  placeholder={`${t('exams.option', 'Option')} ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {formData.type !== 'true_false' && formData.options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title={t('common.delete', 'Delete')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {errors.options && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.options}</p>
        )}
        {errors.correctAnswer && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.correctAnswer}</p>
        )}
      </div>
    );
  };

  /**
   * Render text answer editor
   */
  const renderTextAnswerEditor = () => {
    if (!['short_answer', 'essay'].includes(formData.type)) {
      return null;
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formData.type === 'essay'
              ? t('exams.sampleAnswer', 'Sample Answer')
              : t('exams.correctAnswer', 'Correct Answer')}
          </label>
          <textarea
            value={formData.correctAnswer || ''}
            onChange={e => handleFieldChange('correctAnswer', e.target.value)}
            placeholder={
              formData.type === 'essay'
                ? t('exams.sampleAnswerPlaceholder', 'Provide a sample answer or key points...')
                : t('exams.correctAnswerPlaceholder', 'Enter the correct answer...')
            }
            rows={formData.type === 'essay' ? 6 : 3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          {errors.correctAnswer && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.correctAnswer}</p>
          )}
        </div>

        {formData.type === 'short_answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exams.keywords', 'Keywords')} ({t('common.optional', 'Optional')})
            </label>
            <input
              type="text"
              value={formData.keywords?.join(', ') || ''}
              onChange={e =>
                handleFieldChange(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k)
                )
              }
              placeholder={t('exams.keywordsPlaceholder', 'Enter keywords separated by commas...')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('exams.keywordsHelp', 'Keywords help with automatic grading of short answers')}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('exams.maxLength', 'Maximum Length')}
          </label>
          <input
            type="number"
            value={formData.maxLength || ''}
            onChange={e => handleFieldChange('maxLength', parseInt(e.target.value) || null)}
            placeholder={formData.type === 'essay' ? '1000' : '100'}
            min="1"
            max={formData.type === 'essay' ? '5000' : '500'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('exams.maxLengthHelp', 'Maximum number of characters allowed')}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen || !question) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={e => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('exams.editQuestion', 'Edit Question')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.type && t(`exams.questionTypes.${formData.type}`, formData.type)}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'basic', name: t('exams.basicInfo', 'Basic Info') },
              { id: 'content', name: t('exams.content', 'Content') },
              { id: 'settings', name: t('exams.settings', 'Settings') },
              { id: 'media', name: t('exams.media', 'Media') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('exams.questionTitle', 'Question Title')} *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      placeholder={t('exams.questionTitlePlaceholder', 'Enter your question...')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('exams.description', 'Description')} ({t('common.optional', 'Optional')})
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      placeholder={t(
                        'exams.descriptionPlaceholder',
                        'Additional context or instructions...'
                      )}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('exams.points', 'Points')} *
                      </label>
                      <input
                        type="number"
                        value={formData.points || ''}
                        onChange={e => handleFieldChange('points', parseInt(e.target.value) || 1)}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                      {errors.points && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.points}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('exams.difficulty', 'Difficulty')}
                      </label>
                      <select
                        value={formData.difficulty || 'medium'}
                        onChange={e => handleFieldChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="easy">{t('exams.easy', 'Easy')}</option>
                        <option value="medium">{t('exams.medium', 'Medium')}</option>
                        <option value="hard">{t('exams.hard', 'Hard')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('exams.category', 'Category')}
                      </label>
                      <select
                        value={formData.category || 'general'}
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
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {renderOptionEditor()}
                  {renderTextAnswerEditor()}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('exams.explanation', 'Explanation')} ({t('common.optional', 'Optional')})
                    </label>
                    <textarea
                      value={formData.explanation || ''}
                      onChange={e => handleFieldChange('explanation', e.target.value)}
                      placeholder={t(
                        'exams.explanationPlaceholder',
                        'Explain why this is the correct answer...'
                      )}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t(
                        'exams.explanationHelp',
                        'This will be shown to students after they answer'
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('exams.timeLimit', 'Time Limit')} ({t('common.optional', 'Optional')})
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.timeLimit || ''}
                        onChange={e =>
                          handleFieldChange('timeLimit', parseInt(e.target.value) || null)
                        }
                        placeholder="60"
                        min="1"
                        max="3600"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.seconds', 'seconds')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('exams.timeLimitHelp', 'Leave empty for no time limit')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="required"
                      checked={formData.required !== false}
                      onChange={e => handleFieldChange('required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('exams.requiredQuestion', 'Required Question')}
                    </label>
                  </div>

                  {['multiple_choice', 'multiple_select'].includes(formData.type) && (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="randomizeOptions"
                        checked={formData.randomizeOptions || false}
                        onChange={e => handleFieldChange('randomizeOptions', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="randomizeOptions"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {t('exams.randomizeOptions', 'Randomize Option Order')}
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('exams.tags', 'Tags')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder={t('exams.addTagPlaceholder', 'Add a tag and press Enter...')}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const tag = e.target.value.trim();
                          if (tag) {
                            handleAddTag(tag);
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <PhotoIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('exams.mediaSupport', 'Media Support')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t(
                        'exams.mediaSupportDesc',
                        'Media upload functionality will be available soon'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{t('common.save', 'Save')}</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionEditor;
