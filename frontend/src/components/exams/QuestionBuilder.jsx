import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * Question Types Configuration
 */
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    icon: CheckIcon,
    description: 'Single correct answer from multiple options',
    minOptions: 2,
    maxOptions: 6,
    allowMultiple: false,
  },
  MULTIPLE_SELECT: {
    id: 'multiple_select',
    name: 'Multiple Select',
    icon: CheckIcon,
    description: 'Multiple correct answers from options',
    minOptions: 2,
    maxOptions: 8,
    allowMultiple: true,
  },
  TRUE_FALSE: {
    id: 'true_false',
    name: 'True/False',
    icon: CheckIcon,
    description: 'Simple true or false question',
    minOptions: 2,
    maxOptions: 2,
    allowMultiple: false,
  },
  SHORT_ANSWER: {
    id: 'short_answer',
    name: 'Short Answer',
    icon: DocumentTextIcon,
    description: 'Brief text response',
    minOptions: 0,
    maxOptions: 0,
    allowMultiple: false,
  },
  ESSAY: {
    id: 'essay',
    name: 'Essay',
    icon: DocumentTextIcon,
    description: 'Long-form written response',
    minOptions: 0,
    maxOptions: 0,
    allowMultiple: false,
  },
};

/**
 * Difficulty Levels
 */
const DIFFICULTY_LEVELS = {
  EASY: { id: 'easy', name: 'Easy', color: 'green', points: 1 },
  MEDIUM: { id: 'medium', name: 'Medium', color: 'yellow', points: 2 },
  HARD: { id: 'hard', name: 'Hard', color: 'red', points: 3 },
};

/**
 * Question Builder Component
 * Comprehensive question creation and management system
 */
const QuestionBuilder = ({ 
  questions = [], 
  onQuestionsChange, 
  categories = [],
  onCategoriesChange,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState(null);

  /**
   * Create a new question template
   */
  const createNewQuestion = useCallback((type = 'multiple_choice') => {
    const questionTemplate = {
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: '',
      description: '',
      points: DIFFICULTY_LEVELS.MEDIUM.points,
      difficulty: 'medium',
      category: categories[0]?.id || 'general',
      timeLimit: null,
      required: true,
      randomizeOptions: false,
      explanation: '',
      tags: [],
      media: {
        images: [],
        videos: [],
        audio: [],
        documents: [],
      },
      options: type === 'true_false' 
        ? [
            { id: 'true', text: 'True', isCorrect: false },
            { id: 'false', text: 'False', isCorrect: false }
          ]
        : type === 'multiple_choice' || type === 'multiple_select'
        ? [
            { id: 'option_1', text: '', isCorrect: false },
            { id: 'option_2', text: '', isCorrect: false }
          ]
        : [],
      correctAnswer: type === 'short_answer' || type === 'essay' ? '' : null,
      keywords: type === 'short_answer' ? [] : null,
      maxLength: type === 'essay' ? 1000 : type === 'short_answer' ? 100 : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return questionTemplate;
  }, [categories]);

  /**
   * Add a new question
   */
  const handleAddQuestion = useCallback((type) => {
    const newQuestion = createNewQuestion(type);
    const updatedQuestions = [...questions, newQuestion];
    onQuestionsChange(updatedQuestions);
    setActiveQuestion(newQuestion.id);
    setShowQuestionForm(true);
    toast.success(t('exams.questionAdded', 'Question added successfully'));
  }, [questions, onQuestionsChange, createNewQuestion, t]);

  /**
   * Update a question
   */
  const handleUpdateQuestion = useCallback((questionId, updates) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId 
        ? { ...q, ...updates, updatedAt: new Date().toISOString() }
        : q
    );
    onQuestionsChange(updatedQuestions);
  }, [questions, onQuestionsChange]);

  /**
   * Delete a question
   */
  const handleDeleteQuestion = useCallback((questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
    if (activeQuestion === questionId) {
      setActiveQuestion(null);
      setShowQuestionForm(false);
    }
    toast.success(t('exams.questionDeleted', 'Question deleted successfully'));
  }, [questions, onQuestionsChange, activeQuestion, t]);

  /**
   * Duplicate a question
   */
  const handleDuplicateQuestion = useCallback((questionId) => {
    const questionToDuplicate = questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${questionToDuplicate.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedQuestions = [...questions, duplicatedQuestion];
      onQuestionsChange(updatedQuestions);
      toast.success(t('exams.questionDuplicated', 'Question duplicated successfully'));
    }
  }, [questions, onQuestionsChange, t]);

  /**
   * Move question up/down
   */
  const handleMoveQuestion = useCallback((questionId, direction) => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];

    onQuestionsChange(updatedQuestions);
  }, [questions, onQuestionsChange]);

  /**
   * Handle drag and drop
   */
  const handleDragStart = useCallback((e, questionId) => {
    setDraggedQuestion(questionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetQuestionId) => {
    e.preventDefault();
    
    if (!draggedQuestion || draggedQuestion === targetQuestionId) {
      setDraggedQuestion(null);
      return;
    }

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedQuestion(null);
      return;
    }

    const updatedQuestions = [...questions];
    const [draggedItem] = updatedQuestions.splice(draggedIndex, 1);
    updatedQuestions.splice(targetIndex, 0, draggedItem);

    onQuestionsChange(updatedQuestions);
    setDraggedQuestion(null);
  }, [draggedQuestion, questions, onQuestionsChange]);

  /**
   * Get question type configuration
   */
  const getQuestionTypeConfig = useCallback((type) => {
    return QUESTION_TYPES[type.toUpperCase()] || QUESTION_TYPES.MULTIPLE_CHOICE;
  }, []);

  /**
   * Get difficulty configuration
   */
  const getDifficultyConfig = useCallback((difficulty) => {
    return DIFFICULTY_LEVELS[difficulty.toUpperCase()] || DIFFICULTY_LEVELS.MEDIUM;
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('exams.questionBuilder', 'Question Builder')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('exams.questionBuilderDesc', 'Create and manage exam questions with various types and media support')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {questions.length} {t('exams.questions', 'questions')}
          </span>
          
          {/* Add Question Dropdown */}
          <div className="relative group">
            <Button
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{t('exams.addQuestion', 'Add Question')}</span>
            </Button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2">
                {Object.values(QUESTION_TYPES).map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleAddQuestion(type.id)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {type.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {questions.map((question, index) => {
            const typeConfig = getQuestionTypeConfig(question.type);
            const difficultyConfig = getDifficultyConfig(question.difficulty);

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                draggable
                onDragStart={(e) => handleDragStart(e, question.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question.id)}
                className={`group relative ${
                  draggedQuestion === question.id ? 'opacity-50' : ''
                }`}
              >
                <Card 
                  variant="default" 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    activeQuestion === question.id 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setActiveQuestion(question.id);
                    setShowQuestionForm(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Q{index + 1}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <typeConfig.icon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {typeConfig.name}
                            </span>
                          </div>

                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${difficultyConfig.color}-100 text-${difficultyConfig.color}-800 dark:bg-${difficultyConfig.color}-900/20 dark:text-${difficultyConfig.color}-400`}>
                            {difficultyConfig.name} ({question.points} pts)
                          </div>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {question.title || t('exams.untitledQuestion', 'Untitled Question')}
                        </h3>

                        {question.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {question.description}
                          </p>
                        )}

                        {/* Question Stats */}
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          {question.options && question.options.length > 0 && (
                            <span>{question.options.length} options</span>
                          )}
                          {question.media && Object.values(question.media).some(arr => arr.length > 0) && (
                            <span>Has media</span>
                          )}
                          {question.timeLimit && (
                            <span>{question.timeLimit}s time limit</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(question.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('common.moveUp', 'Move Up')}
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(question.id, 'down');
                          }}
                          disabled={index === questions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('common.moveDown', 'Move Down')}
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateQuestion(question.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title={t('common.duplicate', 'Duplicate')}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title={t('common.delete', 'Delete')}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('exams.noQuestions', 'No questions yet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('exams.noQuestionsDesc', 'Start building your exam by adding questions')}
            </p>
            <Button
              variant="primary"
              onClick={() => handleAddQuestion('multiple_choice')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{t('exams.addFirstQuestion', 'Add Your First Question')}</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilder;
