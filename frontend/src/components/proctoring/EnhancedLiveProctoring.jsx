import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  FaVideo,
  FaMicrophone,
  FaEye,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUser,
  FaClock,
  FaDesktop,
  FaWifi,
  FaWifiSlash,
  FaPlay,
  FaStop,
  FaCamera,
  FaMicrophoneSlash,
  FaBrain,
  FaChartLine,
} from 'react-icons/fa';
import realtimeProctoringService from '../../services/realtimeProctoring';

const EnhancedLiveProctoring = ({
  examId,
  studentId,
  examDuration = 60,
  onViolation,
  onTrustScoreUpdate,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [violations, setViolations] = useState([]);
  const [trustScore, setTrustScore] = useState(100);
  const [trustScoreCategory, setTrustScoreCategory] = useState('excellent');
  const [trustScoreTrend, setTrustScoreTrend] = useState('stable');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [examStartTime, setExamStartTime] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState({
    faceDetection: false,
    audioMonitor: false,
    screenMonitor: false,
    behaviorAnalysis: false,
  });
  const [aiResults, setAiResults] = useState(null);
  const [frameAnalysisCount, setFrameAnalysisCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Setup proctoring service callbacks
    realtimeProctoringService.on('onConnect', handleConnect);
    realtimeProctoringService.on('onDisconnect', handleDisconnect);
    realtimeProctoringService.on('onViolation', handleViolation);
    realtimeProctoringService.on('onTrustScoreUpdate', handleTrustScoreUpdate);
    realtimeProctoringService.on('onFrameAnalysis', handleFrameAnalysis);
    realtimeProctoringService.on('onError', handleError);

    return () => {
      // Cleanup callbacks
      realtimeProctoringService.off('onConnect', handleConnect);
      realtimeProctoringService.off('onDisconnect', handleDisconnect);
      realtimeProctoringService.off('onViolation', handleViolation);
      realtimeProctoringService.off('onTrustScoreUpdate', handleTrustScoreUpdate);
      realtimeProctoringService.off('onFrameAnalysis', handleFrameAnalysis);
      realtimeProctoringService.off('onError', handleError);

      // End session if active
      if (isActive) {
        realtimeProctoringService.endSession();
      }
    };
  }, [isActive]);

  const handleConnect = data => {
    setIsConnected(true);
    setDetectionStatus({
      faceDetection: true,
      audioMonitor: true,
      screenMonitor: true,
      behaviorAnalysis: true,
    });
    toast.success(t('proctoring.connected'));
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDetectionStatus({
      faceDetection: false,
      audioMonitor: false,
      screenMonitor: false,
      behaviorAnalysis: false,
    });
    toast.error(t('proctoring.disconnected'));
  };

  const handleViolation = violation => {
    const newViolation = {
      id: Date.now(),
      type: violation.type,
      description: violation.description,
      timestamp: new Date(violation.timestamp),
      severity: violation.severity,
      confidence: violation.confidence,
    };

    setViolations(prev => [...prev, newViolation]);

    if (onViolation) {
      onViolation(newViolation);
    }
  };

  const handleTrustScoreUpdate = trustScoreData => {
    setTrustScore(trustScoreData.current_score);
    setTrustScoreCategory(trustScoreData.category);
    setTrustScoreTrend(trustScoreData.trend);
    setRecommendations(trustScoreData.recommendations || []);

    if (onTrustScoreUpdate) {
      onTrustScoreUpdate(trustScoreData);
    }
  };

  const handleFrameAnalysis = data => {
    setAiResults(data.aiResults);
    setFrameAnalysisCount(prev => prev + 1);
  };

  const handleError = error => {
    console.error('Proctoring error:', error);
    toast.error(`${t('proctoring.error')}: ${error.message || t('common.unknownError')}`);
  };

  const startProctoring = async () => {
    try {
      setExamStartTime(new Date());
      await realtimeProctoringService.initializeSession(examId, studentId, examDuration);
      setIsActive(true);
      toast.success(t('proctoring.started'));
    } catch (error) {
      console.error('Error starting proctoring:', error);
      toast.error(t('proctoring.startError'));
    }
  };

  const stopProctoring = async () => {
    try {
      await realtimeProctoringService.endSession();
      setIsActive(false);
      setIsConnected(false);
      setExamStartTime(null);
      toast.success(t('proctoring.stopped'));
    } catch (error) {
      console.error('Error stopping proctoring:', error);
      toast.error(t('proctoring.stopError'));
    }
  };

  const getElapsedTime = () => {
    if (!examStartTime) return '00:00:00';
    const elapsed = Math.floor((currentTime - examStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrustScoreColor = () => {
    if (trustScore >= 80) return 'text-green-500';
    if (trustScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrustScoreBarColor = () => {
    if (trustScore >= 80) return 'bg-green-500';
    if (trustScore >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrustScoreLabel = () => {
    switch (trustScoreCategory) {
      case 'excellent':
        return t('proctoring.trustScore.excellent');
      case 'good':
        return t('proctoring.trustScore.good');
      case 'fair':
        return t('proctoring.trustScore.fair');
      case 'poor':
        return t('proctoring.trustScore.poor');
      case 'critical':
        return t('proctoring.trustScore.critical');
      default:
        return t('common.unknown');
    }
  };

  const getTrendIcon = () => {
    switch (trustScoreTrend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'critical':
        return 'border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <FaBrain className="text-blue-500" />
          <span>{t('proctoring.title')}</span>
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaClock className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{getElapsedTime()}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <FaWifi className="text-green-500" />
            ) : (
              <FaWifiSlash className="text-red-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {isConnected ? t('proctoring.connected') : t('proctoring.disconnected')}
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {isActive ? t('proctoring.active') : t('proctoring.inactive')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FaCamera className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-400">{t('proctoring.cameraInactive')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('proctoring.clickToStart')}</p>
                </div>
              </div>
            )}

            {/* AI Analysis Overlay */}
            {isActive && aiResults && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                <div>
                  {t('proctoring.faces')}: {aiResults.face_detection?.faces_detected || 0}
                </div>
                <div>
                  {t('proctoring.quality')}:{' '}
                  {aiResults.frame_quality?.overall_quality || t('common.unknown')}
                </div>
                <div>
                  {t('proctoring.analysis')}: #{frameAnalysisCount}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {!isActive ? (
              <button
                onClick={startProctoring}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FaPlay />
                <span>{t('proctoring.startButton')}</span>
              </button>
            ) : (
              <button
                onClick={stopProctoring}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FaStop />
                <span>{t('proctoring.stopButton')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Monitoring Panel */}
        <div className="space-y-4">
          {/* Trust Score */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <FaShieldAlt className={getTrustScoreColor()} />
                <span>{t('proctoring.trustScore.title')}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <FaChartLine className={getTrustScoreColor()} />
                <span className="text-sm">{getTrendIcon()}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full transition-all duration-500 ${getTrustScoreBarColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${trustScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {trustScore.toFixed(1)}% - {getTrustScoreLabel()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('proctoring.trend')}: {t(`proctoring.trends.${trustScoreTrend}`)}
              </p>
            </div>
          </div>

          {/* Detection Status */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-lg p-3 ${
                detectionStatus.faceDetection
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaEye
                  className={detectionStatus.faceDetection ? 'text-green-500' : 'text-gray-400'}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('proctoring.faceDetection')}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  detectionStatus.faceDetection
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {detectionStatus.faceDetection ? t('proctoring.active') : t('proctoring.inactive')}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 ${
                detectionStatus.audioMonitor
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                {detectionStatus.audioMonitor ? (
                  <FaMicrophone className="text-green-500" />
                ) : (
                  <FaMicrophoneSlash className="text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('proctoring.audioMonitor')}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  detectionStatus.audioMonitor
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {detectionStatus.audioMonitor ? t('proctoring.active') : t('proctoring.inactive')}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 ${
                detectionStatus.screenMonitor
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaDesktop
                  className={detectionStatus.screenMonitor ? 'text-purple-500' : 'text-gray-400'}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('proctoring.screenMonitor')}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  detectionStatus.screenMonitor
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {detectionStatus.screenMonitor ? t('proctoring.active') : t('proctoring.inactive')}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 ${
                detectionStatus.behaviorAnalysis
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaBrain
                  className={detectionStatus.behaviorAnalysis ? 'text-orange-500' : 'text-gray-400'}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('proctoring.aiAnalysis')}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  detectionStatus.behaviorAnalysis
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {detectionStatus.behaviorAnalysis
                  ? t('proctoring.active')
                  : t('proctoring.inactive')}
              </p>
            </div>
          </div>

          {/* Recent Violations */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('proctoring.recentViolations')}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {violations.slice(-5).map(violation => (
                  <motion.div
                    key={violation.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center space-x-2 p-2 rounded border-l-4 ${getSeverityColor(violation.severity)}`}
                  >
                    <FaExclamationTriangle className="text-red-500 text-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {violation.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {violation.timestamp.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(violation.confidence * 100)}% {t('proctoring.confidence')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {violations.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('proctoring.noViolations')}
                </p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                {t('proctoring.recommendations')}
              </h3>
              <ul className="space-y-1">
                {recommendations.slice(0, 3).map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-800 dark:text-blue-300">
                    • {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLiveProctoring;
