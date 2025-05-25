import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  FolderIcon,
  DocumentTextIcon,
  TagIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import QuestionEditor from './QuestionEditor';
import toast from 'react-hot-toast';

/**
 * Question Bank Management Component
 * Centralized repository for managing exam questions with categories and filtering
 */
const QuestionBank = ({ 
  questions = [], 
  onQuestionsChange,
  categories = [],
  onCategoriesChange,
  onSelectQuestions,
  selectionMode = false,
  selectedQuestions = [],
  className = '' 
}) => {
  const { t } = useTranslation();
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filter and sort questions
  useEffect(() => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.title?.toLowerCase().includes(term) ||
        q.description?.toLowerCase().includes(term) ||
        q.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'difficulty_asc':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        case 'difficulty_desc':
          const difficultyOrderDesc = { easy: 3, medium: 2, hard: 1 };
          return (difficultyOrderDesc[a.difficulty] || 2) - (difficultyOrderDesc[b.difficulty] || 2);
        case 'points_asc':
          return (a.points || 0) - (b.points || 0);
        case 'points_desc':
          return (b.points || 0) - (a.points || 0);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'created_desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, selectedType, sortBy]);

  /**
   * Handle question selection
   */
  const handleQuestionSelect = useCallback((questionId, selected) => {
    if (!selectionMode) return;

    const updatedSelection = selected
      ? [...selectedQuestions, questionId]
      : selectedQuestions.filter(id => id !== questionId);

    onSelectQuestions?.(updatedSelection);
  }, [selectionMode, selectedQuestions, onSelectQuestions]);

  /**
   * Handle select all/none
   */
  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.length === filteredQuestions.length) {
      onSelectQuestions?.([]);
    } else {
      onSelectQuestions?.(filteredQuestions.map(q => q.id));
    }
  }, [selectedQuestions, filteredQuestions, onSelectQuestions]);

  /**
   * Add new category
   */
  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCategoryName.trim(),
      description: '',
      createdAt: new Date().toISOString(),
    };

    onCategoriesChange?.([...categories, newCategory]);
    setNewCategoryName('');
    setShowCategoryForm(false);
    toast.success(t('exams.categoryAdded', 'Category added successfully'));
  }, [newCategoryName, categories, onCategoriesChange, t]);

  /**
   * Get question type display name
   */
  const getQuestionTypeDisplay = useCallback((type) => {
    const typeMap = {
      multiple_choice: t('exams.multipleChoice', 'Multiple Choice'),
      multiple_select: t('exams.multipleSelect', 'Multiple Select'),
      true_false: t('exams.trueFalse', 'True/False'),
      short_answer: t('exams.shortAnswer', 'Short Answer'),
      essay: t('exams.essay', 'Essay'),
    };
    return typeMap[type] || type;
  }, [t]);

  /**
   * Get difficulty color
   */
  const getDifficultyColor = useCallback((difficulty) => {
    const colorMap = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red',
    };
    return colorMap[difficulty] || 'gray';
  }, []);

  /**
   * Export questions
   */
  const handleExportQuestions = useCallback(() => {
    const questionsToExport = selectionMode && selectedQuestions.length > 0
      ? questions.filter(q => selectedQuestions.includes(q.id))
      : filteredQuestions;

    const dataStr = JSON.stringify(questionsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('exams.questionsExported', 'Questions exported successfully'));
  }, [selectionMode, selectedQuestions, questions, filteredQuestions, t]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('exams.questionBank', 'Question Bank')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('exams.questionBankDesc', 'Manage your collection of exam questions')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectionMode && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedQuestions.length} {t('common.selected', 'selected')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedQuestions.length === filteredQuestions.length 
                  ? t('common.selectNone', 'Select None')
                  : t('common.selectAll', 'Select All')
                }
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportQuestions}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>{t('common.export', 'Export')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>{t('common.filters', 'Filters')}</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="default">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('exams.searchQuestions', 'Search questions...')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('exams.category', 'Category')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('common.all', 'All')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('exams.difficulty', 'Difficulty')}
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('common.all', 'All')}</option>
                    <option value="easy">{t('exams.easy', 'Easy')}</option>
                    <option value="medium">{t('exams.medium', 'Medium')}</option>
                    <option value="hard">{t('exams.hard', 'Hard')}</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('exams.type', 'Type')}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">{t('common.all', 'All')}</option>
                    <option value="multiple_choice">{t('exams.multipleChoice', 'Multiple Choice')}</option>
                    <option value="multiple_select">{t('exams.multipleSelect', 'Multiple Select')}</option>
                    <option value="true_false">{t('exams.trueFalse', 'True/False')}</option>
                    <option value="short_answer">{t('exams.shortAnswer', 'Short Answer')}</option>
                    <option value="essay">{t('exams.essay', 'Essay')}</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common.sortBy', 'Sort By')}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="created_desc">{t('common.newestFirst', 'Newest First')}</option>
                    <option value="created_asc">{t('common.oldestFirst', 'Oldest First')}</option>
                    <option value="title_asc">{t('common.titleAZ', 'Title A-Z')}</option>
                    <option value="title_desc">{t('common.titleZA', 'Title Z-A')}</option>
                    <option value="difficulty_asc">{t('common.easiestFirst', 'Easiest First')}</option>
                    <option value="difficulty_desc">{t('common.hardestFirst', 'Hardest First')}</option>
                    <option value="points_asc">{t('common.lowestPoints', 'Lowest Points')}</option>
                    <option value="points_desc">{t('common.highestPoints', 'Highest Points')}</option>
                  </select>
                </div>

                {/* Add Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('exams.addCategory', 'Add Category')}
                  </label>
                  {showCategoryForm ? (
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={t('exams.categoryName', 'Category name')}
                        className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryForm(false);
                          setNewCategoryName('');
                        }}
                        className="px-2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCategoryForm(true)}
                      className="w-full flex items-center justify-center space-x-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>{t('common.add', 'Add')}</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {t('exams.showingQuestions', 'Showing {{count}} of {{total}} questions', {
            count: filteredQuestions.length,
            total: questions.length,
          })}
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('common.clearSearch', 'Clear search')}
          </button>
        )}
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredQuestions.map((question, index) => {
            const isSelected = selectedQuestions.includes(question.id);
            const difficultyColor = getDifficultyColor(question.difficulty);

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card 
                  variant="default"
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => selectionMode ? handleQuestionSelect(question.id, !isSelected) : setEditingQuestion(question)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuestionSelect(question.id, e.target.checked);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${difficultyColor}-100 text-${difficultyColor}-800 dark:bg-${difficultyColor}-900/20 dark:text-${difficultyColor}-400`}>
                          {question.difficulty} ({question.points} pts)
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuestion(question);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title={t('common.edit', 'Edit')}
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {question.title || t('exams.untitledQuestion', 'Untitled Question')}
                    </h3>

                    {question.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {question.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{getQuestionTypeDisplay(question.type)}</span>
                      <span>
                        {categories.find(c => c.id === question.category)?.name || question.category}
                      </span>
                    </div>

                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {question.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{question.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all'
              ? t('exams.noQuestionsFound', 'No questions found')
              : t('exams.noQuestionsInBank', 'No questions in bank')
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all'
              ? t('exams.tryDifferentFilters', 'Try adjusting your search or filters')
              : t('exams.startAddingQuestions', 'Start by adding questions to your bank')
            }
          </p>
          {(!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && selectedType === 'all') && (
            <Button
              variant="primary"
              onClick={() => setEditingQuestion({ type: 'multiple_choice' })}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{t('exams.addFirstQuestion', 'Add Your First Question')}</span>
            </Button>
          )}
        </motion.div>
      )}

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          categories={categories}
          isOpen={!!editingQuestion}
          onSave={(updatedQuestion) => {
            if (editingQuestion.id) {
              // Update existing question
              const updatedQuestions = questions.map(q =>
                q.id === editingQuestion.id ? updatedQuestion : q
              );
              onQuestionsChange(updatedQuestions);
            } else {
              // Add new question
              const newQuestion = {
                ...updatedQuestion,
                id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
              };
              onQuestionsChange([...questions, newQuestion]);
            }
            setEditingQuestion(null);
          }}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

export default QuestionBank;
