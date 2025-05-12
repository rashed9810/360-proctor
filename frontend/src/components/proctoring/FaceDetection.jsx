import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import WebcamStream from './WebcamStream';
import { motion } from 'framer-motion';
import { FaceSmileIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Enhanced face detection service with improved reliability
// Note: This is still a mock but with more realistic behavior
// In production, this would be replaced with TensorFlow.js or a similar library
const enhancedFaceDetection = async imageData => {
  // Simulate processing time (reduced for better performance)
  await new Promise(resolve => setTimeout(resolve, 200));

  // Store detection history to improve stability
  if (!enhancedFaceDetection.history) {
    enhancedFaceDetection.history = {
      lastResults: [],
      maxHistoryLength: 5,
    };
  }

  // Generate more realistic detection result
  // In a real implementation, this would use actual ML models
  const rawDetection = {
    // Base probability is higher (95%) to reduce false negatives
    faceDetected: Math.random() < 0.95,
    // Multiple faces detection with lower probability (5%)
    multipleFaces: Math.random() < 0.05,
    // More stable face position with slight movement
    facePosition: {
      x: 0.35 + (Math.random() * 0.1 - 0.05), // 30-40% of width with small variation
      y: 0.35 + (Math.random() * 0.1 - 0.05), // 30-40% of height with small variation
      width: 0.25 + Math.random() * 0.05, // 25-30% of width
      height: 0.35 + Math.random() * 0.05, // 35-40% of height
    },
    // More realistic confidence values
    confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
    // Add eye tracking data
    eyesOpen: Math.random() < 0.9,
    lookingAtScreen: Math.random() < 0.95,
    // Add timestamp for tracking
    timestamp: Date.now(),
  };

  // Add to history
  enhancedFaceDetection.history.lastResults.push(rawDetection);

  // Keep history at max length
  if (
    enhancedFaceDetection.history.lastResults.length >
    enhancedFaceDetection.history.maxHistoryLength
  ) {
    enhancedFaceDetection.history.lastResults.shift();
  }

  // Apply temporal smoothing for stability
  const smoothedResult = applyTemporalSmoothing(enhancedFaceDetection.history.lastResults);

  return {
    ...smoothedResult,
    // Add detection metadata
    processingTimeMs: Math.round(Math.random() * 50 + 150), // 150-200ms
    detectionMethod: 'mock-enhanced',
    noFaceFrames: smoothedResult.faceDetected ? 0 : 1,
    multiFaceFrames: smoothedResult.multipleFaces ? 1 : 0,
  };
};

// Apply temporal smoothing to reduce jitter and false detections
const applyTemporalSmoothing = detectionHistory => {
  if (!detectionHistory || detectionHistory.length === 0) {
    return {
      faceDetected: false,
      multipleFaces: false,
      facePosition: null,
      confidence: 0,
    };
  }

  // Count face detections in history
  const faceDetectedCount = detectionHistory.filter(r => r.faceDetected).length;
  const multipleFacesCount = detectionHistory.filter(r => r.multipleFaces).length;

  // Calculate face detection probability
  const faceDetectionProbability = faceDetectedCount / detectionHistory.length;
  const multipleFacesProbability = multipleFacesCount / detectionHistory.length;

  // Apply threshold for stable detection
  const stableFaceDetected = faceDetectionProbability > 0.6; // 60% threshold
  const stableMultipleFaces = multipleFacesProbability > 0.4; // 40% threshold

  // Calculate average confidence
  const avgConfidence =
    detectionHistory.filter(r => r.faceDetected).reduce((sum, r) => sum + r.confidence, 0) /
    (faceDetectedCount || 1);

  // Calculate average face position (only from frames with detected faces)
  const facesWithPosition = detectionHistory.filter(r => r.faceDetected && r.facePosition);

  let avgPosition = null;
  if (facesWithPosition.length > 0) {
    avgPosition = {
      x: facesWithPosition.reduce((sum, r) => sum + r.facePosition.x, 0) / facesWithPosition.length,
      y: facesWithPosition.reduce((sum, r) => sum + r.facePosition.y, 0) / facesWithPosition.length,
      width:
        facesWithPosition.reduce((sum, r) => sum + r.facePosition.width, 0) /
        facesWithPosition.length,
      height:
        facesWithPosition.reduce((sum, r) => sum + r.facePosition.height, 0) /
        facesWithPosition.length,
    };
  }

  return {
    faceDetected: stableFaceDetected,
    multipleFaces: stableMultipleFaces,
    facePosition: avgPosition,
    confidence: avgConfidence,
    // Add eye tracking data (from most recent detection)
    eyesOpen: detectionHistory[detectionHistory.length - 1].eyesOpen,
    lookingAtScreen: detectionHistory[detectionHistory.length - 1].lookingAtScreen,
  };
};

/**
 * FaceDetection component for detecting faces in webcam stream
 * @param {Object} props - Component props
 * @param {Function} props.onFaceDetected - Callback when face is detected
 * @param {Function} props.onNoFaceDetected - Callback when no face is detected
 * @param {Function} props.onMultipleFaces - Callback when multiple faces are detected
 * @param {number} props.detectionInterval - Interval between detections in ms
 * @param {boolean} props.showDebugInfo - Whether to show debug information
 */
const FaceDetection = ({
  onFaceDetected,
  onNoFaceDetected,
  onMultipleFaces,
  detectionInterval = 1000,
  showDebugInfo = false,
}) => {
  const { t } = useTranslation('proctoring');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consecutiveNoFace, setConsecutiveNoFace] = useState(0);
  const [consecutiveMultiFace, setConsecutiveMultiFace] = useState(0);

  // Handle webcam stream
  const handleStream = videoStream => {
    setStream(videoStream);
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  };

  // Handle webcam error
  const handleError = error => {
    console.error('Webcam error:', error);
    toast.error(t('proctoring.webcamError'));
  };

  // Process video frame for face detection
  const processVideoFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !stream || isProcessing) return;

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas (flipped horizontally)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

      // Get image data for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Process image data with enhanced face detection
      const result = await enhancedFaceDetection(imageData);
      setDetectionResult(result);

      // Draw face rectangle if face detected
      if (result.faceDetected && result.facePosition) {
        const { x, y, width, height } = result.facePosition;
        const rectX = x * canvas.width;
        const rectY = y * canvas.height;
        const rectWidth = width * canvas.width;
        const rectHeight = height * canvas.height;

        context.strokeStyle = result.multipleFaces ? 'red' : 'green';
        context.lineWidth = 3;
        context.strokeRect(rectX, rectY, rectWidth, rectHeight);

        // Draw confidence text
        context.font = '16px Arial';
        context.fillStyle = result.multipleFaces ? 'red' : 'green';
        context.fillText(`${Math.round(result.confidence * 100)}%`, rectX, rectY - 5);
      }

      // Handle detection results
      if (!result.faceDetected) {
        setConsecutiveNoFace(prev => prev + 1);
        setConsecutiveMultiFace(0);

        if (consecutiveNoFace >= 3 && onNoFaceDetected) {
          onNoFaceDetected();
        }
      } else if (result.multipleFaces) {
        setConsecutiveMultiFace(prev => prev + 1);
        setConsecutiveNoFace(0);

        if (consecutiveMultiFace >= 2 && onMultipleFaces) {
          onMultipleFaces();
        }
      } else {
        setConsecutiveNoFace(0);
        setConsecutiveMultiFace(0);

        if (onFaceDetected) {
          onFaceDetected(result);
        }
      }
    } catch (error) {
      console.error('Error processing video frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Set up interval for face detection
  useEffect(() => {
    if (!stream) return;

    const intervalId = setInterval(processVideoFrame, detectionInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [stream, isProcessing, detectionInterval]);

  return (
    <div className="relative">
      {/* Hidden video element for stream */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Canvas for face detection visualization */}
      <canvas ref={canvasRef} className="w-full h-auto rounded-lg" />

      {/* Webcam stream component */}
      <div className="hidden">
        <WebcamStream onStream={handleStream} onError={handleError} autoStart={true} />
      </div>

      {/* Status indicators */}
      {detectionResult && (
        <div className="absolute top-2 left-2 flex items-center bg-gray-900 bg-opacity-70 rounded-lg px-3 py-1.5 text-white text-sm">
          {detectionResult.faceDetected ? (
            detectionResult.multipleFaces ? (
              <>
                <UserGroupIcon className="h-5 w-5 text-red-500 mr-1.5" />
                <span>{t('proctoring.multipleFacesDetected')}</span>
              </>
            ) : (
              <>
                <FaceSmileIcon className="h-5 w-5 text-green-500 mr-1.5" />
                <span>{t('proctoring.faceDetected')}</span>
              </>
            )
          ) : (
            <>
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
              <span>{t('proctoring.noFaceDetected')}</span>
            </>
          )}
        </div>
      )}

      {/* Enhanced debug information */}
      {showDebugInfo && detectionResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 text-white text-xs font-mono"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1.5 ${detectionResult.faceDetected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span>Face detected:</span>
              <span
                className={`ml-1 font-medium ${detectionResult.faceDetected ? 'text-green-400' : 'text-red-400'}`}
              >
                {detectionResult.faceDetected ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1.5 ${!detectionResult.multipleFaces ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span>Multiple faces:</span>
              <span
                className={`ml-1 font-medium ${!detectionResult.multipleFaces ? 'text-green-400' : 'text-red-400'}`}
              >
                {detectionResult.multipleFaces ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center">
              <span>Confidence:</span>
              <span
                className={`ml-1 font-medium ${detectionResult.confidence > 0.8 ? 'text-green-400' : detectionResult.confidence > 0.6 ? 'text-yellow-400' : 'text-red-400'}`}
              >
                {Math.round(detectionResult.confidence * 100)}%
              </span>
            </div>

            <div className="flex items-center">
              <span>Processing:</span>
              <span className="ml-1 font-medium text-blue-400">
                {detectionResult.processingTimeMs || '?'}ms
              </span>
            </div>

            <div className="flex items-center">
              <span>No face frames:</span>
              <span
                className={`ml-1 font-medium ${consecutiveNoFace > 2 ? 'text-red-400' : 'text-gray-400'}`}
              >
                {consecutiveNoFace}
              </span>
            </div>

            <div className="flex items-center">
              <span>Multi-face frames:</span>
              <span
                className={`ml-1 font-medium ${consecutiveMultiFace > 1 ? 'text-red-400' : 'text-gray-400'}`}
              >
                {consecutiveMultiFace}
              </span>
            </div>

            {detectionResult.eyesOpen !== undefined && (
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-1.5 ${detectionResult.eyesOpen ? 'bg-green-500' : 'bg-yellow-500'}`}
                ></div>
                <span>Eyes open:</span>
                <span
                  className={`ml-1 font-medium ${detectionResult.eyesOpen ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {detectionResult.eyesOpen ? 'Yes' : 'No'}
                </span>
              </div>
            )}

            {detectionResult.lookingAtScreen !== undefined && (
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-1.5 ${detectionResult.lookingAtScreen ? 'bg-green-500' : 'bg-yellow-500'}`}
                ></div>
                <span>Looking at screen:</span>
                <span
                  className={`ml-1 font-medium ${detectionResult.lookingAtScreen ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {detectionResult.lookingAtScreen ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FaceDetection;
