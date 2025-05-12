import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import WebcamStream from './WebcamStream';
import FaceDetection from './FaceDetection';
import EyeTracking from './EyeTracking';
import AudioAnalysis from './AudioAnalysis';
import TabMonitor from './TabMonitor';
import toast from 'react-hot-toast';

// Mock phone detection service (to be replaced with actual AI implementation)
const mockPhoneDetection = async imageData => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  // Randomly determine if a phone is detected (5% chance)
  const phoneDetected = Math.random() < 0.05;

  return {
    phoneDetected,
    confidence: phoneDetected ? 0.7 + Math.random() * 0.3 : 0, // 70-100% confidence
    boundingBox: phoneDetected
      ? {
          x: 0.3 + Math.random() * 0.4, // 30-70% of width
          y: 0.3 + Math.random() * 0.4, // 30-70% of height
          width: 0.1 + Math.random() * 0.1, // 10-20% of width
          height: 0.2 + Math.random() * 0.1, // 20-30% of height
        }
      : null,
  };
};

/**
 * ProctorView component that integrates all proctoring features
 * @param {Object} props - Component props
 * @param {Function} props.onViolation - Callback when a violation is detected
 * @param {Function} props.onTrustScoreUpdate - Callback when trust score is updated
 * @param {boolean} props.showDebugInfo - Whether to show debug information
 */
const ProctorView = ({ onViolation, onTrustScoreUpdate, showDebugInfo = false }) => {
  const { t } = useTranslation('proctoring');
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [trustScore, setTrustScore] = useState(100);
  const [violations, setViolations] = useState([]);
  const [isPhoneDetectionActive, setIsPhoneDetectionActive] = useState(true);
  const [phoneDetectionResult, setPhoneDetectionResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examDuration, setExamDuration] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Initialize exam timer
  useEffect(() => {
    // Set mock exam duration (60 minutes)
    const duration = 60 * 60 * 1000; // 60 minutes in milliseconds
    const startTime = new Date();

    setExamStartTime(startTime);
    setExamDuration(duration);
    setTimeRemaining(duration);

    // Update time remaining every second
    const intervalId = setInterval(() => {
      const elapsed = new Date() - startTime;
      const remaining = Math.max(0, duration - elapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        // Handle exam time up
        toast.success(t('proctoring.examTimeUp'));
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!timeRemaining) return '--:--:--';

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle webcam stream
  const handleStream = videoStream => {
    setStream(videoStream);
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  };

  // Handle webcam error
  const handleStreamError = error => {
    console.error('Webcam error:', error);
    addViolation('cameraError', 'high');
  };

  // Handle face detection events
  const handleNoFaceDetected = () => {
    addViolation('noFaceDetected', 'medium');
  };

  const handleMultipleFaces = () => {
    addViolation('multipleFacesDetected', 'high');
  };

  // Handle eye tracking events
  const handleLookingAway = () => {
    addViolation('lookingAway', 'low');
  };

  const handleEyesClosed = () => {
    addViolation('eyesClosed', 'low');
  };

  // Handle audio analysis events
  const handleSuspiciousSpeech = data => {
    addViolation('suspiciousSpeech', 'medium', data);
  };

  // Handle tab monitoring events
  const handleTabSwitch = () => {
    addViolation('tabSwitch', 'high');
  };

  const handleWindowBlur = () => {
    addViolation('windowBlur', 'medium');
  };

  const handleFullscreenExit = () => {
    setIsFullscreen(false);
    addViolation('fullscreenExit', 'medium');
  };

  // Phone detection
  useEffect(() => {
    if (!stream || !isPhoneDetectionActive) return;

    let isActive = true;

    const detectPhone = async () => {
      if (!videoRef.current || !isActive) return;

      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for processing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Process image data with phone detection
        const result = await mockPhoneDetection(imageData);
        setPhoneDetectionResult(result);

        if (result.phoneDetected) {
          addViolation('phoneDetected', 'high');
        }
      } catch (error) {
        console.error('Error detecting phone:', error);
      }

      // Schedule next detection if still active
      if (isActive) {
        setTimeout(detectPhone, 2000); // Check every 2 seconds
      }
    };

    detectPhone();

    return () => {
      isActive = false;
    };
  }, [stream, isPhoneDetectionActive]);

  // Calculate trust score based on violations
  const calculateTrustScore = violations => {
    // Base score starts at 100
    let baseScore = 100;

    // Count violations by severity
    const highSeverityCount = violations.filter(v => v.severity === 'high').length;
    const mediumSeverityCount = violations.filter(v => v.severity === 'medium').length;
    const lowSeverityCount = violations.filter(v => v.severity === 'low').length;

    // Apply weighted deductions
    // High severity violations have exponential impact (more severe as they accumulate)
    const highSeverityDeduction = Math.min(
      50,
      highSeverityCount * 10 * (1 + highSeverityCount * 0.1)
    );

    // Medium severity violations have linear impact
    const mediumSeverityDeduction = Math.min(30, mediumSeverityCount * 5);

    // Low severity violations have diminishing impact
    const lowSeverityDeduction = Math.min(20, lowSeverityCount * 2 * (1 - lowSeverityCount * 0.05));

    // Calculate final score with minimum of 0
    const finalScore = Math.max(
      0,
      Math.round(baseScore - highSeverityDeduction - mediumSeverityDeduction - lowSeverityDeduction)
    );

    return finalScore;
  };

  // Add a violation to the list and update trust score
  const addViolation = (type, severity, data = null) => {
    const timestamp = new Date();

    // Create violation object with detailed information
    const violation = {
      id: `${type}-${timestamp.getTime()}`,
      type,
      severity,
      timestamp,
      data,
      formattedTime: timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      confidence: severity === 'high' ? 0.9 : severity === 'medium' ? 0.8 : 0.7,
    };

    // Add to violations list (avoid duplicates within 5 seconds)
    setViolations(prev => {
      const recentSameType = prev.find(v => v.type === type && timestamp - v.timestamp < 5000);

      if (recentSameType) {
        return prev;
      }

      const newViolations = [violation, ...prev];

      // Calculate new trust score based on all violations
      const newTrustScore = calculateTrustScore(newViolations);
      setTrustScore(newTrustScore);

      // Call onViolation callback
      if (onViolation) {
        onViolation(violation, newViolations);
      }

      // Call onTrustScoreUpdate callback
      if (onTrustScoreUpdate) {
        onTrustScoreUpdate(newTrustScore);
      }

      // Show toast notification for high severity violations
      if (severity === 'high') {
        toast.error(t(`violations.${type}`), {
          duration: 5000,
          icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        });
      } else if (severity === 'medium') {
        toast(t(`violations.${type}`), {
          duration: 4000,
          icon: '⚠️',
          style: {
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
          },
        });
      }

      return newViolations;
    });
  };

  // Get trust score color
  const getTrustScoreColor = () => {
    if (trustScore >= 80) return 'text-green-500';
    if (trustScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get severity badge color
  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format timestamp
  const formatTime = timestamp => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('liveProctoring')}
          </h2>

          <div className="flex items-center space-x-4">
            {/* Trust score */}
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-1.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('trustScore')}:
              </span>
              <span className={`ml-1.5 text-lg font-bold ${getTrustScoreColor()}`}>
                {trustScore}
              </span>
            </div>

            {/* Time remaining */}
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-1.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('timeRemaining')}:
              </span>
              <span className="ml-1.5 text-lg font-mono font-bold text-gray-900 dark:text-white">
                {formatTimeRemaining()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Video feed */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {/* Hidden video element for stream */}
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />

              {/* Face detection component */}
              <FaceDetection
                onNoFaceDetected={handleNoFaceDetected}
                onMultipleFaces={handleMultipleFaces}
                showDebugInfo={showDebugInfo}
              />
            </div>

            {/* Audio analysis */}
            <div className="mt-4">
              <AudioAnalysis
                onSuspiciousSpeech={handleSuspiciousSpeech}
                autoStart={true}
                showTranscript={true}
              />
            </div>
          </div>

          {/* Right column - Monitoring tools */}
          <div>
            {/* Tab monitor with enhanced detection */}
            <TabMonitor
              onTabSwitch={handleTabSwitch}
              onWindowBlur={handleWindowBlur}
              onFullscreenExit={handleFullscreenExit}
              enforceFullscreen={false}
              showWarnings={true}
              timeRemaining={timeRemaining}
              totalExamTime={examDuration}
            />

            {/* Violations list */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('violationsTitle')}
              </h3>

              {violations.length === 0 ? (
                <div className="text-center py-6">
                  <ShieldCheckIcon className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noViolationsDetected')}</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {violations.map(violation => (
                    <motion.div
                      key={violation.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start p-3 mb-2 rounded-md border border-gray-100 dark:border-gray-700"
                    >
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {t(`violations.${violation.type}`)}
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(violation.severity)}`}
                          >
                            {t(`severity.${violation.severity}`)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(violation.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctorView;
