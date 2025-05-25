import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CameraIcon,
  SignalIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced Live Proctoring Interface Component
 * Provides real-time monitoring with beautiful animations and comprehensive features
 */
const LiveProctoringInterface = ({ examId, studentId, onViolationDetected }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState([]);
  const [trustScore, setTrustScore] = useState(100);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [detectionStats, setDetectionStats] = useState({
    faceDetected: true,
    eyeTracking: true,
    audioLevel: 0,
    tabSwitches: 0,
    phoneDetected: false,
    multipleFaces: false,
  });

  // Initialize camera and monitoring
  useEffect(() => {
    if (isMonitoring) {
      initializeCamera();
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoring]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setConnectionStatus('connected');
        toast.success(t('proctoring.cameraInitialized', 'Camera initialized successfully'));
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      toast.error(t('proctoring.cameraError', 'Failed to access camera'));
      setConnectionStatus('error');
    }
  };

  const startMonitoring = () => {
    setConnectionStatus('monitoring');
    // Simulate real-time monitoring updates
    const interval = setInterval(() => {
      updateDetectionStats();
      checkForViolations();
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setConnectionStatus('disconnected');
  };

  const updateDetectionStats = () => {
    // Simulate real-time detection updates
    setDetectionStats(prev => ({
      ...prev,
      audioLevel: Math.random() * 100,
      eyeTracking: Math.random() > 0.1,
      faceDetected: Math.random() > 0.05,
    }));
  };

  const checkForViolations = () => {
    // Simulate violation detection
    const violationTypes = [
      'tabSwitch',
      'faceNotDetected',
      'multipleFaces',
      'phoneDetected',
      'audioDetected',
    ];

    if (Math.random() < 0.02) { // 2% chance of violation per second
      const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      const newViolation = {
        id: Date.now(),
        type: violationType,
        timestamp: new Date(),
        severity: Math.random() > 0.5 ? 'high' : 'medium',
      };

      setViolations(prev => [newViolation, ...prev.slice(0, 9)]);
      setTrustScore(prev => Math.max(0, prev - Math.random() * 10));
      
      if (onViolationDetected) {
        onViolationDetected(newViolation);
      }

      toast.error(t(`proctoring.violations.${violationType}`, `${violationType} detected`));
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'monitoring': return 'text-blue-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <WifiIcon className="h-4 w-4" />;
      case 'monitoring': return <SignalIcon className="h-4 w-4" />;
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ComputerDesktopIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('proctoring.liveMonitoring', 'Live Proctoring')}
              </h2>
              <div className={`flex items-center space-x-2 text-sm ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMonitoring}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isMonitoring
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isMonitoring ? (
                <>
                  <StopIcon className="h-4 w-4 mr-2 inline" />
                  {t('proctoring.stopMonitoring', 'Stop Monitoring')}
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2 inline" />
                  {t('proctoring.startMonitoring', 'Start Monitoring')}
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('proctoring.trustScore', 'Trust Score')}
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(trustScore)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${
                trustScore >= 80
                  ? 'bg-green-500'
                  : trustScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Monitoring Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                {t('proctoring.studentFeed', 'Student Feed')}
              </h3>
            </div>
            <div className="relative bg-gray-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: 'none' }}
              />
              
              {/* Overlay indicators */}
              <div className="absolute top-4 left-4 space-y-2">
                <AnimatePresence>
                  {detectionStats.faceDetected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>Face Detected</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recording indicator */}
              {isMonitoring && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500/80 text-white px-3 py-1 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>LIVE</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Detection Stats and Violations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Detection Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {t('proctoring.detectionStats', 'Detection Stats')}
            </h3>
            
            <div className="space-y-4">
              {/* Face Detection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Face</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${detectionStats.faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              {/* Audio Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MicrophoneIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Audio</span>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 bg-purple-500 rounded-full transition-all duration-200"
                    style={{ width: `${detectionStats.audioLevel}%` }}
                  />
                </div>
              </div>

              {/* Tab Switches */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ComputerDesktopIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tab Switches</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {detectionStats.tabSwitches}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Violations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
              {t('proctoring.recentViolations', 'Recent Violations')}
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {violations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No violations detected</p>
                  </motion.div>
                ) : (
                  violations.map((violation, index) => (
                    <motion.div
                      key={violation.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border-l-4 ${
                        violation.severity === 'high'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t(`proctoring.violations.${violation.type}`, violation.type)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {violation.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveProctoringInterface;
