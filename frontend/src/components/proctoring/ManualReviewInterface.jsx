import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * Review Status Types
 */
const REVIEW_STATUS = {
  PENDING: { id: 'pending', name: 'Pending Review', color: 'yellow' },
  APPROVED: { id: 'approved', name: 'Approved', color: 'green' },
  FLAGGED: { id: 'flagged', name: 'Flagged', color: 'red' },
  DISMISSED: { id: 'dismissed', name: 'Dismissed', color: 'gray' },
  NEEDS_ATTENTION: { id: 'needs_attention', name: 'Needs Attention', color: 'orange' },
};

/**
 * Manual Review Interface Component
 * Comprehensive interface for reviewing flagged proctoring sessions
 */
const ManualReviewInterface = ({
  examId,
  onReviewComplete,
  onStatusChange,
  className = '',
}) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    dateRange: '7d',
    searchTerm: '',
  });
  const [reviewData, setReviewData] = useState({
    decision: '',
    notes: '',
    trustScoreAdjustment: 0,
    actionRequired: false,
  });

  // Mock data for demonstration
  const mockSessions = [
    {
      id: 'session_1',
      studentId: 'student_123',
      studentName: 'John Doe',
      examTitle: 'Mathematics Final Exam',
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(Date.now() - 1800000), // 30 minutes ago
      duration: 1800, // 30 minutes
      status: 'pending',
      trustScore: 65,
      violationCount: 8,
      flaggedViolations: [
        {
          id: 'v1',
          type: 'face_not_detected',
          timestamp: new Date(Date.now() - 3000000),
          severity: 'high',
          confidence: 0.95,
          duration: 15000,
        },
        {
          id: 'v2',
          type: 'multiple_faces',
          timestamp: new Date(Date.now() - 2700000),
          severity: 'high',
          confidence: 0.88,
          duration: 8000,
        },
        {
          id: 'v3',
          type: 'tab_switching',
          timestamp: new Date(Date.now() - 2400000),
          severity: 'medium',
          confidence: 1.0,
          duration: 0,
        },
      ],
      recordings: {
        video: '/recordings/session_1_video.mp4',
        audio: '/recordings/session_1_audio.mp3',
        screen: '/recordings/session_1_screen.mp4',
      },
      aiAnalysis: {
        suspiciousPatterns: true,
        riskScore: 0.75,
        recommendations: ['manual_review', 'trust_score_reduction'],
      },
    },
    {
      id: 'session_2',
      studentId: 'student_456',
      studentName: 'Jane Smith',
      examTitle: 'Physics Midterm',
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      endTime: new Date(Date.now() - 5400000), // 1.5 hours ago
      duration: 1800,
      status: 'needs_attention',
      trustScore: 45,
      violationCount: 12,
      flaggedViolations: [
        {
          id: 'v4',
          type: 'phone_detected',
          timestamp: new Date(Date.now() - 6600000),
          severity: 'high',
          confidence: 0.92,
          duration: 5000,
        },
      ],
      recordings: {
        video: '/recordings/session_2_video.mp4',
        audio: '/recordings/session_2_audio.mp3',
      },
      aiAnalysis: {
        suspiciousPatterns: true,
        riskScore: 0.85,
        recommendations: ['immediate_review', 'exam_invalidation'],
      },
    },
  ];

  /**
   * Load sessions for review
   */
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on current filters
      let filteredSessions = mockSessions;
      
      if (filters.status !== 'all') {
        filteredSessions = filteredSessions.filter(s => s.status === filters.status);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredSessions = filteredSessions.filter(s => 
          s.studentName.toLowerCase().includes(term) ||
          s.examTitle.toLowerCase().includes(term)
        );
      }
      
      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error(t('review.loadError', 'Failed to load sessions'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, t]);

  /**
   * Submit review decision
   */
  const submitReview = useCallback(async () => {
    if (!selectedSession || !reviewData.decision) {
      toast.error(t('review.decisionRequired', 'Please select a decision'));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reviewResult = {
        sessionId: selectedSession.id,
        decision: reviewData.decision,
        notes: reviewData.notes,
        trustScoreAdjustment: reviewData.trustScoreAdjustment,
        reviewedAt: new Date(),
        reviewerId: 'admin_123', // Current user ID
      };

      // Update session status
      setSessions(prev => 
        prev.map(s => 
          s.id === selectedSession.id 
            ? { ...s, status: reviewData.decision, reviewResult }
            : s
        )
      );

      // Notify parent component
      onReviewComplete?.(reviewResult);
      onStatusChange?.(selectedSession.id, reviewData.decision);

      // Reset form
      setReviewData({
        decision: '',
        notes: '',
        trustScoreAdjustment: 0,
        actionRequired: false,
      });

      setSelectedSession(null);
      
      toast.success(t('review.reviewSubmitted', 'Review submitted successfully'));
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('review.submitError', 'Failed to submit review'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedSession, reviewData, onReviewComplete, onStatusChange, t]);

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const statusConfig = REVIEW_STATUS[status.toUpperCase()];
    return statusConfig ? statusConfig.color : 'gray';
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  // Load sessions on component mount and filter changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <EyeIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('review.manualReview', 'Manual Review Interface')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('review.reviewFlaggedSessions', 'Review flagged proctoring sessions')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadSessions}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4" />
            )}
            <span>{t('common.refresh', 'Refresh')}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="default">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('review.status', 'Status')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">{t('common.all', 'All')}</option>
                {Object.values(REVIEW_STATUS).map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('review.severity', 'Severity')}
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">{t('common.all', 'All')}</option>
                <option value="high">{t('common.high', 'High')}</option>
                <option value="medium">{t('common.medium', 'Medium')}</option>
                <option value="low">{t('common.low', 'Low')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('review.dateRange', 'Date Range')}
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="1d">{t('common.today', 'Today')}</option>
                <option value="7d">{t('common.last7Days', 'Last 7 Days')}</option>
                <option value="30d">{t('common.last30Days', 'Last 30 Days')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.search', 'Search')}
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder={t('review.searchPlaceholder', 'Search students or exams...')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('review.sessionsForReview', 'Sessions for Review')} ({sessions.length})</span>
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('common.loading', 'Loading...')}
                </p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session) => {
                  const statusColor = getStatusColor(session.status);
                  const isSelected = selectedSession?.id === session.id;

                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.studentName}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {session.examTitle}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/20 dark:text-${statusColor}-400`}>
                          {REVIEW_STATUS[session.status.toUpperCase()]?.name || session.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ShieldCheckIcon className="h-3 w-3" />
                          <span>{session.trustScore}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          <span>{session.violationCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{Math.round(session.duration / 60)}m</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('review.noSessionsForReview', 'No sessions require review')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details and Review */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>
              {selectedSession 
                ? t('review.sessionDetails', 'Session Details')
                : t('review.selectSession', 'Select a Session')
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {t('review.student', 'Student')}:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedSession.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {t('review.exam', 'Exam')}:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedSession.examTitle}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {t('review.trustScore', 'Trust Score')}:
                    </p>
                    <p className={`font-semibold ${
                      selectedSession.trustScore > 70 ? 'text-green-600' :
                      selectedSession.trustScore > 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedSession.trustScore}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {t('review.violations', 'Violations')}:
                    </p>
                    <p className="text-red-600 font-semibold">
                      {selectedSession.violationCount}
                    </p>
                  </div>
                </div>

                {/* Flagged Violations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('review.flaggedViolations', 'Flagged Violations')}
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedSession.flaggedViolations.map((violation) => (
                      <div
                        key={violation.id}
                        className={`p-2 rounded text-xs ${getSeverityColor(violation.severity)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {t(`proctoring.violations.${violation.type}`, violation.type)}
                          </span>
                          <span>{violation.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {t('proctoring.confidence', 'Confidence')}: {Math.round(violation.confidence * 100)}%
                          {violation.duration > 0 && (
                            <span className="ml-2">
                              {t('review.duration', 'Duration')}: {Math.round(violation.duration / 1000)}s
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedSession.aiAnalysis && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('review.aiAnalysis', 'AI Analysis')}
                    </h4>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="font-medium">{t('review.riskScore', 'Risk Score')}:</span>
                          <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                            {Math.round(selectedSession.aiAnalysis.riskScore * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{t('review.suspiciousPatterns', 'Suspicious Patterns')}:</span>
                          <span className="ml-2">
                            {selectedSession.aiAnalysis.suspiciousPatterns ? 
                              t('common.yes', 'Yes') : t('common.no', 'No')
                            }
                          </span>
                        </div>
                      </div>
                      {selectedSession.aiAnalysis.recommendations.length > 0 && (
                        <div>
                          <span className="font-medium">{t('review.recommendations', 'Recommendations')}:</span>
                          <ul className="list-disc list-inside ml-2 text-xs">
                            {selectedSession.aiAnalysis.recommendations.map((rec, index) => (
                              <li key={index}>
                                {t(`review.recommendations.${rec}`, rec)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Review Form */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('review.makeDecision', 'Make Review Decision')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('review.decision', 'Decision')} *
                      </label>
                      <select
                        value={reviewData.decision}
                        onChange={(e) => setReviewData(prev => ({ ...prev, decision: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">{t('review.selectDecision', 'Select decision...')}</option>
                        <option value="approved">{t('review.approved', 'Approved')}</option>
                        <option value="flagged">{t('review.flagged', 'Flagged')}</option>
                        <option value="dismissed">{t('review.dismissed', 'Dismissed')}</option>
                        <option value="needs_attention">{t('review.needsAttention', 'Needs Attention')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('review.notes', 'Review Notes')}
                      </label>
                      <textarea
                        value={reviewData.notes}
                        onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t('review.notesPlaceholder', 'Add your review notes...')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('review.trustScoreAdjustment', 'Trust Score Adjustment')}
                      </label>
                      <input
                        type="number"
                        value={reviewData.trustScoreAdjustment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, trustScoreAdjustment: parseInt(e.target.value) || 0 }))}
                        min="-50"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('review.adjustmentHelp', 'Positive values increase trust score, negative values decrease it')}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={submitReview}
                      disabled={!reviewData.decision || isLoading}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      <span>{t('review.submitReview', 'Submit Review')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <EyeIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('review.selectSessionToReview', 'Select a session to review')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualReviewInterface;
