import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  VideoCameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EyeIcon,
  FaceSmileIcon,
  CameraIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Advanced Face Detection Component
 * AI-powered face detection with multiple violation types and confidence scoring
 */
const AdvancedFaceDetection = ({
  isActive = false,
  onViolationDetected,
  onFaceStatusChange,
  onConfidenceChange,
  showVideo = true,
  enableRecording = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const recordingRef = useRef(null);
  const violationTimeoutRef = useRef(null);

  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [faceStatus, setFaceStatus] = useState('unknown'); // 'detected', 'not_detected', 'multiple', 'unknown'
  const [confidence, setConfidence] = useState(0);
  const [violations, setViolations] = useState([]);
  const [statistics, setStatistics] = useState({
    totalDetections: 0,
    faceDetectedTime: 0,
    violationCount: 0,
    averageConfidence: 0,
    sessionStartTime: null,
  });

  // Face detection configuration
  const detectionConfig = {
    detectionInterval: 1000, // Check every 1 second
    confidenceThreshold: 0.7, // Minimum confidence for valid detection
    violationThreshold: 3000, // Time in ms before flagging as violation
    maxViolationsBeforeAlert: 3, // Maximum violations before major alert
    faceBoxColor: '#10B981', // Green for detected face
    violationColor: '#EF4444', // Red for violations
  };

  /**
   * Initialize camera and face detection
   */
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsInitialized(true);
          setStatistics(prev => ({
            ...prev,
            sessionStartTime: new Date(),
          }));
        };
      }

      // Initialize face detection model (placeholder for actual AI model)
      await initializeFaceDetectionModel();
    } catch (err) {
      console.error('Error initializing camera:', err);
      setError(err.name === 'NotAllowedError' ? 'cameraPermissionDenied' : 'cameraInitError');
      toast.error(t('proctoring.cameraError', 'Camera initialization failed'));
    }
  }, [t]);

  /**
   * Initialize face detection AI model (placeholder)
   * In production, this would load a real AI model like MediaPipe or TensorFlow.js
   */
  const initializeFaceDetectionModel = async () => {
    // Placeholder for AI model initialization
    // In real implementation, you would load models like:
    // - MediaPipe Face Detection
    // - TensorFlow.js Face Detection
    // - OpenCV.js
    console.log('Initializing AI face detection model...');

    // Simulate model loading time
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Face detection model loaded successfully');
  };

  /**
   * Perform face detection analysis
   */
  const performFaceDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      // Perform face detection (placeholder implementation)
      const detectionResult = await simulateFaceDetection(imageData);

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalDetections: prev.totalDetections + 1,
        averageConfidence: (prev.averageConfidence + detectionResult.confidence) / 2,
      }));

      // Process detection result
      processDetectionResult(detectionResult);
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }, [isInitialized]);

  /**
   * Simulate face detection (placeholder for real AI implementation)
   */
  const simulateFaceDetection = async imageData => {
    // Placeholder implementation - in production, this would use real AI models
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing time

    // Generate mock detection results
    const mockResults = [
      { faces: 1, confidence: 0.95, status: 'detected' },
      { faces: 0, confidence: 0, status: 'not_detected' },
      { faces: 2, confidence: 0.85, status: 'multiple' },
      { faces: 1, confidence: 0.6, status: 'low_confidence' },
    ];

    // Randomly select a result (in production, this would be actual AI analysis)
    const randomIndex = Math.floor(Math.random() * 100);
    let selectedResult;

    if (randomIndex < 70) {
      selectedResult = mockResults[0]; // 70% chance of face detected
    } else if (randomIndex < 85) {
      selectedResult = mockResults[1]; // 15% chance of no face
    } else if (randomIndex < 95) {
      selectedResult = mockResults[3]; // 10% chance of low confidence
    } else {
      selectedResult = mockResults[2]; // 5% chance of multiple faces
    }

    return {
      faces: selectedResult.faces,
      confidence: selectedResult.confidence,
      status: selectedResult.status,
      timestamp: new Date(),
      boundingBoxes:
        selectedResult.faces > 0
          ? [
              { x: 100, y: 80, width: 200, height: 240 }, // Mock bounding box
            ]
          : [],
    };
  };

  /**
   * Process face detection results
   */
  const processDetectionResult = useCallback(
    result => {
      const { faces, confidence, status, timestamp, boundingBoxes } = result;

      // Update confidence
      setConfidence(confidence);
      onConfidenceChange?.(confidence);

      // Determine face status
      let newFaceStatus = 'unknown';
      let violationType = null;

      if (faces === 0) {
        newFaceStatus = 'not_detected';
        violationType = 'face_not_detected';
      } else if (faces > 1) {
        newFaceStatus = 'multiple';
        violationType = 'multiple_faces_detected';
      } else if (confidence < detectionConfig.confidenceThreshold) {
        newFaceStatus = 'low_confidence';
        violationType = 'low_confidence_detection';
      } else {
        newFaceStatus = 'detected';
        // Update face detected time
        setStatistics(prev => ({
          ...prev,
          faceDetectedTime: prev.faceDetectedTime + detectionConfig.detectionInterval,
        }));
      }

      // Update face status
      setFaceStatus(newFaceStatus);
      onFaceStatusChange?.(newFaceStatus, confidence);

      // Handle violations
      if (violationType) {
        handleViolation(violationType, confidence, timestamp);
      } else {
        // Clear violation timeout if face is properly detected
        if (violationTimeoutRef.current) {
          clearTimeout(violationTimeoutRef.current);
          violationTimeoutRef.current = null;
        }
      }

      // Draw detection results on canvas
      drawDetectionResults(boundingBoxes, newFaceStatus);
    },
    [onConfidenceChange, onFaceStatusChange]
  );

  /**
   * Handle violation detection
   */
  const handleViolation = useCallback(
    (type, confidence, timestamp) => {
      // Clear existing timeout
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }

      // Set new timeout for violation
      violationTimeoutRef.current = setTimeout(() => {
        const violation = {
          id: `violation_${Date.now()}`,
          type,
          confidence,
          timestamp,
          severity: confidence < 0.3 ? 'high' : confidence < 0.6 ? 'medium' : 'low',
        };

        // Add to violations list
        setViolations(prev => [violation, ...prev.slice(0, 9)]); // Keep last 10

        // Update statistics
        setStatistics(prev => ({
          ...prev,
          violationCount: prev.violationCount + 1,
        }));

        // Notify parent component
        onViolationDetected?.(violation);

        // Show toast notification for high severity violations
        if (violation.severity === 'high') {
          toast.error(t(`proctoring.violations.${type}`, type), {
            duration: 5000,
            icon: '🚨',
          });
        }
      }, detectionConfig.violationThreshold);
    },
    [onViolationDetected, t]
  );

  /**
   * Draw detection results on canvas
   */
  const drawDetectionResults = (boundingBoxes, status) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw bounding boxes
    boundingBoxes.forEach(box => {
      ctx.strokeStyle =
        status === 'detected' ? detectionConfig.faceBoxColor : detectionConfig.violationColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw confidence score
      ctx.fillStyle =
        status === 'detected' ? detectionConfig.faceBoxColor : detectionConfig.violationColor;
      ctx.font = '16px Arial';
      ctx.fillText(`${Math.round(confidence * 100)}%`, box.x, box.y - 10);
    });

    // Draw status indicator
    const statusText = t(`proctoring.faceStatus.${status}`, status);
    ctx.fillStyle =
      status === 'detected' ? detectionConfig.faceBoxColor : detectionConfig.violationColor;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(statusText, 10, 30);
  };

  /**
   * Start face detection
   */
  const startDetection = useCallback(() => {
    if (!isInitialized) return;

    setIsDetecting(true);
    detectionIntervalRef.current = setInterval(
      performFaceDetection,
      detectionConfig.detectionInterval
    );
  }, [isInitialized, performFaceDetection]);

  /**
   * Stop face detection
   */
  const stopDetection = useCallback(() => {
    setIsDetecting(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
      violationTimeoutRef.current = null;
    }
  }, []);

  /**
   * Cleanup resources
   */
  const cleanup = useCallback(() => {
    stopDetection();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (recordingRef.current) {
      recordingRef.current.stop();
      recordingRef.current = null;
    }

    setIsInitialized(false);
  }, [stopDetection]);

  // Initialize camera when component mounts or isActive changes
  useEffect(() => {
    if (isActive) {
      initializeCamera();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isActive, initializeCamera, cleanup]);

  // Start/stop detection based on isActive and isInitialized
  useEffect(() => {
    if (isActive && isInitialized) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isInitialized, startDetection, stopDetection]);

  /**
   * Get status color
   */
  const getStatusColor = status => {
    switch (status) {
      case 'detected':
        return 'text-green-500';
      case 'not_detected':
        return 'text-red-500';
      case 'multiple':
        return 'text-orange-500';
      case 'low_confidence':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = status => {
    switch (status) {
      case 'detected':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'not_detected':
        return <XCircleIcon className="h-5 w-5" />;
      case 'multiple':
        return <UserIcon className="h-5 w-5" />;
      case 'low_confidence':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <EyeIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <VideoCameraIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('proctoring.advancedFaceDetection', 'Advanced Face Detection')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t(
                'proctoring.aiPoweredMonitoring',
                'AI-powered face monitoring and violation detection'
              )}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 ${getStatusColor(faceStatus)}`}>
            {getStatusIcon(faceStatus)}
            <span className="text-sm font-medium">
              {t(`proctoring.faceStatus.${faceStatus}`, faceStatus)}
            </span>
          </div>
          {isDetecting && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {t(`proctoring.errors.${error}`, error)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Video Display */}
      {showVideo && (
        <div className="relative">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-64 object-cover" muted playsInline />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />

            {/* Overlay Information */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {t('proctoring.confidence', 'Confidence')}: {Math.round(confidence * 100)}%
            </div>

            {isDetecting && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>{t('proctoring.monitoring', 'Monitoring')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <ChartBarIcon className="h-6 w-6 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {statistics.totalDetections}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {t('proctoring.totalDetections', 'Detections')}
          </p>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <ClockIcon className="h-6 w-6 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {Math.round(statistics.faceDetectedTime / 1000)}s
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            {t('proctoring.faceTime', 'Face Time')}
          </p>
        </div>

        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {statistics.violationCount}
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            {t('proctoring.violations', 'Violations')}
          </p>
        </div>

        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <ShieldCheckIcon className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
            {Math.round(statistics.averageConfidence * 100)}%
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {t('proctoring.avgConfidence', 'Avg Confidence')}
          </p>
        </div>
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('proctoring.recentViolations', 'Recent Violations')}
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {violations.slice(0, 5).map(violation => (
                <motion.div
                  key={violation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    violation.severity === 'high'
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                      : violation.severity === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                  }`}
                >
                  <span>{t(`proctoring.violations.${violation.type}`, violation.type)}</span>
                  <span>{violation.timestamp.toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFaceDetection;
