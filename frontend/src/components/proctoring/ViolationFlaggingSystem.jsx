import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  EyeIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BellIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * Violation Types Configuration
 */
const VIOLATION_TYPES = {
  FACE_NOT_DETECTED: {
    id: 'face_not_detected',
    name: 'Face Not Detected',
    icon: EyeIcon,
    severity: 'high',
    threshold: 5000, // 5 seconds
    description: 'Student face is not visible in the camera',
    autoFlag: true,
    points: 10,
  },
  MULTIPLE_FACES: {
    id: 'multiple_faces',
    name: 'Multiple Faces Detected',
    icon: EyeIcon,
    severity: 'high',
    threshold: 2000, // 2 seconds
    description: 'Multiple people detected in the camera view',
    autoFlag: true,
    points: 15,
  },
  TAB_SWITCHING: {
    id: 'tab_switching',
    name: 'Tab Switching',
    icon: ComputerDesktopIcon,
    severity: 'medium',
    threshold: 0, // Immediate
    description: 'Student switched to another browser tab',
    autoFlag: true,
    points: 5,
  },
  SUSPICIOUS_AUDIO: {
    id: 'suspicious_audio',
    name: 'Suspicious Audio',
    icon: SpeakerWaveIcon,
    severity: 'medium',
    threshold: 3000, // 3 seconds
    description: 'Suspicious audio patterns detected',
    autoFlag: true,
    points: 8,
  },
  PHONE_DETECTED: {
    id: 'phone_detected',
    name: 'Phone Detected',
    icon: DocumentTextIcon,
    severity: 'high',
    threshold: 1000, // 1 second
    description: 'Mobile phone detected in camera view',
    autoFlag: true,
    points: 12,
  },
  COPY_PASTE_ATTEMPT: {
    id: 'copy_paste_attempt',
    name: 'Copy/Paste Attempt',
    icon: DocumentTextIcon,
    severity: 'medium',
    threshold: 0, // Immediate
    description: 'Student attempted to copy or paste content',
    autoFlag: true,
    points: 6,
  },
  FULLSCREEN_EXIT: {
    id: 'fullscreen_exit',
    name: 'Fullscreen Exit',
    icon: ComputerDesktopIcon,
    severity: 'low',
    threshold: 0, // Immediate
    description: 'Student exited fullscreen mode',
    autoFlag: false,
    points: 3,
  },
  UNUSUAL_BEHAVIOR: {
    id: 'unusual_behavior',
    name: 'Unusual Behavior',
    icon: ExclamationTriangleIcon,
    severity: 'medium',
    threshold: 10000, // 10 seconds
    description: 'AI detected unusual behavior patterns',
    autoFlag: false,
    points: 7,
  },
};

/**
 * Automated Violation Flagging System
 * ML-powered violation detection and automated flagging
 */
const ViolationFlaggingSystem = ({
  examId,
  studentId,
  isActive = false,
  onViolationFlagged,
  onTrustScoreUpdate,
  settings = {},
  className = '',
}) => {
  const { t } = useTranslation();
  const [violations, setViolations] = useState([]);
  const [flaggedViolations, setFlaggedViolations] = useState([]);
  const [trustScore, setTrustScore] = useState(100);
  const [riskLevel, setRiskLevel] = useState('low'); // 'low', 'medium', 'high', 'critical'
  const [statistics, setStatistics] = useState({
    totalViolations: 0,
    flaggedViolations: 0,
    trustScoreDeduction: 0,
    sessionStartTime: new Date(),
    lastViolationTime: null,
  });

  const violationTimersRef = useRef(new Map());
  const mlModelRef = useRef(null);
  const patternAnalysisRef = useRef({
    violationFrequency: [],
    behaviorPatterns: [],
    timeBasedPatterns: {},
  });

  // Configuration
  const config = {
    trustScoreThresholds: {
      critical: 30,
      high: 50,
      medium: 70,
      low: 85,
    },
    mlAnalysisInterval: 5000, // Analyze patterns every 5 seconds
    maxViolationsPerMinute: 10,
    autoFlagThreshold: 3, // Auto-flag after 3 violations of same type
    ...settings,
  };

  /**
   * Initialize ML model for pattern analysis
   */
  const initializeMLModel = useCallback(async () => {
    try {
      // Placeholder for ML model initialization
      // In production, this would load a real ML model for behavior analysis
      console.log('Initializing ML violation detection model...');

      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      mlModelRef.current = {
        analyzePattern: violations => {
          // Mock ML analysis
          const frequency = violations.length;
          const recentViolations = violations.filter(
            v => Date.now() - new Date(v.timestamp).getTime() < 60000 // Last minute
          );

          return {
            suspiciousPattern: recentViolations.length > 3,
            riskScore: Math.min(frequency * 0.1, 1),
            confidence: 0.85,
            recommendations: frequency > 5 ? ['manual_review'] : [],
          };
        },
        predictBehavior: currentViolations => {
          // Mock behavior prediction
          return {
            likelyNextViolation: 'tab_switching',
            probability: 0.7,
            timeToNext: 30000, // 30 seconds
          };
        },
      };

      console.log('ML model initialized successfully');
    } catch (error) {
      console.error('Error initializing ML model:', error);
    }
  }, []);

  /**
   * Process incoming violation
   */
  const processViolation = useCallback(
    violationData => {
      const violationType = VIOLATION_TYPES[violationData.type.toUpperCase()];
      if (!violationType) return;

      const violation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        examId,
        studentId,
        type: violationData.type,
        severity: violationType.severity,
        timestamp: new Date(),
        confidence: violationData.confidence || 0.8,
        metadata: violationData.metadata || {},
        processed: false,
        flagged: false,
        points: violationType.points,
      };

      // Add to violations list
      setViolations(prev => [violation, ...prev]);

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalViolations: prev.totalViolations + 1,
        lastViolationTime: violation.timestamp,
      }));

      // Check if violation should be auto-flagged
      if (violationType.autoFlag) {
        checkAutoFlag(violation, violationType);
      }

      // Update trust score
      updateTrustScore(violation);

      // Analyze patterns with ML
      analyzeViolationPatterns([violation, ...violations]);

      // Set timer for threshold-based flagging
      if (violationType.threshold > 0) {
        setViolationTimer(violation, violationType);
      }
    },
    [examId, studentId, violations]
  );

  /**
   * Check if violation should be auto-flagged
   */
  const checkAutoFlag = useCallback(
    (violation, violationType) => {
      const recentSameTypeViolations = violations.filter(
        v => v.type === violation.type && Date.now() - new Date(v.timestamp).getTime() < 300000 // Last 5 minutes
      );

      if (recentSameTypeViolations.length >= config.autoFlagThreshold) {
        flagViolation(violation, 'auto_threshold_exceeded');
      }

      // Check severity-based auto-flagging
      if (violationType.severity === 'high' && violation.confidence > 0.9) {
        flagViolation(violation, 'high_severity_high_confidence');
      }
    },
    [violations, config.autoFlagThreshold]
  );

  /**
   * Set violation timer for threshold-based flagging
   */
  const setViolationTimer = useCallback((violation, violationType) => {
    const timerId = setTimeout(() => {
      if (!violation.processed) {
        flagViolation(violation, 'threshold_exceeded');
      }
      violationTimersRef.current.delete(violation.id);
    }, violationType.threshold);

    violationTimersRef.current.set(violation.id, timerId);
  }, []);

  /**
   * Flag a violation
   */
  const flagViolation = useCallback(
    (violation, reason) => {
      const flaggedViolation = {
        ...violation,
        flagged: true,
        flaggedAt: new Date(),
        flagReason: reason,
        requiresReview: violation.severity === 'high',
      };

      setFlaggedViolations(prev => [flaggedViolation, ...prev]);

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        flaggedViolations: prev.flaggedViolations + 1,
      }));

      // Mark violation as processed
      setViolations(prev =>
        prev.map(v => (v.id === violation.id ? { ...v, processed: true, flagged: true } : v))
      );

      // Notify parent component
      onViolationFlagged?.(flaggedViolation);

      // Show notification for high severity violations
      if (violation.severity === 'high') {
        toast.error(
          t('proctoring.violationFlagged', 'Violation flagged: {{type}}', {
            type: t(`proctoring.violations.${violation.type}`, violation.type),
          }),
          { duration: 5000, icon: '🚨' }
        );
      }
    },
    [onViolationFlagged, t]
  );

  /**
   * Update trust score based on violation
   */
  const updateTrustScore = useCallback(
    violation => {
      const violationType = VIOLATION_TYPES[violation.type.toUpperCase()];
      if (!violationType) return;

      const deduction = violationType.points * (violation.confidence || 0.8);
      const newTrustScore = Math.max(0, trustScore - deduction);

      setTrustScore(newTrustScore);

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        trustScoreDeduction: prev.trustScoreDeduction + deduction,
      }));

      // Update risk level
      updateRiskLevel(newTrustScore);

      // Notify parent component
      onTrustScoreUpdate?.(newTrustScore, deduction);
    },
    [trustScore, onTrustScoreUpdate]
  );

  /**
   * Update risk level based on trust score
   */
  const updateRiskLevel = useCallback(
    score => {
      let newRiskLevel = 'low';

      if (score <= config.trustScoreThresholds.critical) {
        newRiskLevel = 'critical';
      } else if (score <= config.trustScoreThresholds.high) {
        newRiskLevel = 'high';
      } else if (score <= config.trustScoreThresholds.medium) {
        newRiskLevel = 'medium';
      }

      setRiskLevel(newRiskLevel);

      // Trigger alerts for high risk levels
      if (newRiskLevel === 'critical') {
        toast.error(t('proctoring.criticalRiskLevel', 'Critical risk level reached!'), {
          duration: 10000,
          icon: '🚨',
        });
      }
    },
    [config.trustScoreThresholds, t]
  );

  /**
   * Analyze violation patterns with ML
   */
  const analyzeViolationPatterns = useCallback(
    async currentViolations => {
      if (!mlModelRef.current) return;

      try {
        const analysis = mlModelRef.current.analyzePattern(currentViolations);

        // Update pattern analysis
        patternAnalysisRef.current = {
          ...patternAnalysisRef.current,
          lastAnalysis: analysis,
          analysisTime: new Date(),
        };

        // Auto-flag based on ML analysis
        if (analysis.suspiciousPattern && analysis.confidence > 0.8) {
          const latestViolation = currentViolations[0];
          if (latestViolation && !latestViolation.flagged) {
            flagViolation(latestViolation, 'ml_suspicious_pattern');
          }
        }
      } catch (error) {
        console.error('Error in ML pattern analysis:', error);
      }
    },
    [flagViolation]
  );

  /**
   * Get risk level color
   */
  const getRiskLevelColor = level => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  /**
   * Get violation severity color
   */
  const getViolationSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Initialize ML model on mount
  useEffect(() => {
    if (isActive) {
      initializeMLModel();
    }
  }, [isActive, initializeMLModel]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      violationTimersRef.current.forEach(timerId => clearTimeout(timerId));
      violationTimersRef.current.clear();
    };
  }, []);

  // Expose processViolation function
  useEffect(() => {
    window.violationFlaggingSystem = { processViolation };
  }, [processViolation]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('proctoring.violationFlagging', 'Violation Flagging System')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('proctoring.automatedDetection', 'Automated violation detection and flagging')}
            </p>
          </div>
        </div>

        {/* Risk Level Indicator */}
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskLevel)}`}
        >
          {t(`proctoring.riskLevel.${riskLevel}`, riskLevel)} {t('common.risk', 'Risk')}
        </div>
      </div>

      {/* Trust Score and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  trustScore > 80
                    ? 'bg-green-100 text-green-600'
                    : trustScore > 60
                      ? 'bg-yellow-100 text-yellow-600'
                      : trustScore > 40
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-red-100 text-red-600'
                }`}
              >
                <span className="text-xl font-bold">{Math.round(trustScore)}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('proctoring.trustScore', 'Trust Score')}
            </p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-4 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {statistics.totalViolations}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {t('proctoring.totalViolations', 'Total Violations')}
            </p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-4 text-center">
            <FlagIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statistics.flaggedViolations}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {t('proctoring.flaggedViolations', 'Flagged')}
            </p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-4 text-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(statistics.trustScoreDeduction)}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('proctoring.scoreDeduction', 'Score Deduction')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>{t('proctoring.recentViolations', 'Recent Violations')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {violations.slice(0, 10).map(violation => {
                  const violationType = VIOLATION_TYPES[violation.type.toUpperCase()];
                  const IconComponent = violationType?.icon || ExclamationTriangleIcon;

                  return (
                    <motion.div
                      key={violation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        violation.flagged
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent
                          className={`h-5 w-5 ${
                            violation.severity === 'high'
                              ? 'text-red-500'
                              : violation.severity === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t(`proctoring.violations.${violation.type}`, violation.type)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {violation.timestamp.toLocaleTimeString()} •
                            {t('proctoring.confidence', 'Confidence')}:{' '}
                            {Math.round(violation.confidence * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getViolationSeverityColor(violation.severity)}`}
                        >
                          {violation.severity}
                        </span>
                        {violation.flagged && <FlagIcon className="h-4 w-4 text-red-500" />}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('proctoring.noViolations', 'No violations detected')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Analysis Results */}
      {patternAnalysisRef.current.lastAnalysis && (
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>{t('proctoring.mlAnalysis', 'ML Pattern Analysis')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(patternAnalysisRef.current.lastAnalysis.riskScore * 100)}%
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('proctoring.riskScore', 'Risk Score')}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {Math.round(patternAnalysisRef.current.lastAnalysis.confidence * 100)}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {t('proctoring.confidence', 'Confidence')}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {patternAnalysisRef.current.lastAnalysis.suspiciousPattern
                    ? t('common.yes', 'Yes')
                    : t('common.no', 'No')}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {t('proctoring.suspiciousPattern', 'Suspicious Pattern')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViolationFlaggingSystem;
