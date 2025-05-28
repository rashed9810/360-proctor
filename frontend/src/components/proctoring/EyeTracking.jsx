import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Mock eye tracking service (to be replaced with actual AI implementation)
const mockEyeTracking = async imageData => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 300));

  // Randomly determine if eyes are detected (95% chance)
  const eyesDetected = Math.random() < 0.95;

  // Randomly determine if user is looking away (15% chance)
  const lookingAway = Math.random() < 0.15;

  // Generate random eye positions
  const leftEye = eyesDetected
    ? {
        x: 0.35 + Math.random() * 0.05,
        y: 0.4 + Math.random() * 0.05,
        open: Math.random() < 0.9, // 90% chance eyes are open
      }
    : null;

  const rightEye = eyesDetected
    ? {
        x: 0.6 + Math.random() * 0.05,
        y: 0.4 + Math.random() * 0.05,
        open: Math.random() < 0.9, // 90% chance eyes are open
      }
    : null;

  // Calculate gaze direction (where the user is looking)
  const gazeDirection = eyesDetected
    ? {
        x: lookingAway ? (Math.random() < 0.5 ? -0.5 : 1.5) : 0.5 + Math.random() * 0.2,
        y: lookingAway ? (Math.random() < 0.5 ? -0.5 : 1.5) : 0.5 + Math.random() * 0.2,
      }
    : null;

  return {
    eyesDetected,
    lookingAway,
    leftEye,
    rightEye,
    gazeDirection,
    confidence: eyesDetected ? 0.7 + Math.random() * 0.3 : 0, // 70-100% confidence
  };
};

/**
 * EyeTracking component for tracking eye movements
 * @param {Object} props - Component props
 * @param {Object} props.videoRef - Reference to video element
 * @param {Function} props.onLookingAway - Callback when user is looking away
 * @param {Function} props.onEyesClosed - Callback when user's eyes are closed
 * @param {number} props.trackingInterval - Interval between tracking in ms
 * @param {boolean} props.showVisualization - Whether to show eye tracking visualization
 */
const EyeTracking = ({
  videoRef,
  onLookingAway,
  onEyesClosed,
  trackingInterval = 1000,
  showVisualization = true,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [trackingResult, setTrackingResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consecutiveLookingAway, setConsecutiveLookingAway] = useState(0);
  const [consecutiveEyesClosed, setConsecutiveEyesClosed] = useState(0);

  // Process video frame for eye tracking
  const processVideoFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    if (video.paused || video.ended || !video.videoWidth) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas (flipped horizontally for webcam)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

      // Get image data for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Process image data with eye tracking
      const result = await mockEyeTracking(imageData);
      setTrackingResult(result);

      // Visualize eye tracking if enabled
      if (showVisualization && result.eyesDetected) {
        // Draw eye positions
        if (result.leftEye) {
          drawEye(context, result.leftEye, canvas.width, canvas.height, result.leftEye.open);
        }

        if (result.rightEye) {
          drawEye(context, result.rightEye, canvas.width, canvas.height, result.rightEye.open);
        }

        // Draw gaze direction
        if (result.gazeDirection) {
          drawGazeDirection(
            context,
            result.leftEye,
            result.rightEye,
            result.gazeDirection,
            canvas.width,
            canvas.height,
            result.lookingAway
          );
        }

        // Draw status text
        context.font = '16px Arial';
        context.fillStyle = result.lookingAway ? 'red' : 'green';
        context.fillText(
          result.lookingAway ? t('proctoring.lookingAway') : t('proctoring.lookingAtScreen'),
          10,
          30
        );
      }

      // Handle tracking results
      if (!result.eyesDetected) {
        // Reset counters if eyes not detected
        setConsecutiveLookingAway(0);
        setConsecutiveEyesClosed(0);
      } else {
        // Check if eyes are closed
        const eyesClosed =
          result.leftEye && result.rightEye && !result.leftEye.open && !result.rightEye.open;

        if (eyesClosed) {
          setConsecutiveEyesClosed(prev => prev + 1);

          if (consecutiveEyesClosed >= 3 && onEyesClosed) {
            onEyesClosed();
          }
        } else {
          setConsecutiveEyesClosed(0);
        }

        // Check if looking away
        if (result.lookingAway) {
          setConsecutiveLookingAway(prev => prev + 1);

          if (consecutiveLookingAway >= 2 && onLookingAway) {
            onLookingAway();
          }
        } else {
          setConsecutiveLookingAway(0);
        }
      }
    } catch (error) {
      console.error('Error processing video frame for eye tracking:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to draw an eye
  const drawEye = (context, eye, canvasWidth, canvasHeight, isOpen) => {
    const x = eye.x * canvasWidth;
    const y = eye.y * canvasHeight;
    const eyeSize = canvasWidth * 0.03;

    context.beginPath();
    context.arc(x, y, eyeSize, 0, 2 * Math.PI);
    context.strokeStyle = isOpen ? 'green' : 'orange';
    context.lineWidth = 2;
    context.stroke();

    if (isOpen) {
      // Draw pupil
      context.beginPath();
      context.arc(x, y, eyeSize / 2, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
    } else {
      // Draw closed eye
      context.beginPath();
      context.moveTo(x - eyeSize, y);
      context.lineTo(x + eyeSize, y);
      context.strokeStyle = 'orange';
      context.lineWidth = 2;
      context.stroke();
    }
  };

  // Helper function to draw gaze direction
  const drawGazeDirection = (
    context,
    leftEye,
    rightEye,
    gazeDirection,
    canvasWidth,
    canvasHeight,
    lookingAway
  ) => {
    if (!leftEye || !rightEye) return;

    // Calculate center point between eyes
    const centerX = ((leftEye.x + rightEye.x) / 2) * canvasWidth;
    const centerY = ((leftEye.y + rightEye.y) / 2) * canvasHeight;

    // Calculate gaze target point
    const targetX = gazeDirection.x * canvasWidth;
    const targetY = gazeDirection.y * canvasHeight;

    // Draw line from center of eyes to gaze target
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(targetX, targetY);
    context.strokeStyle = lookingAway ? 'red' : 'green';
    context.lineWidth = 2;
    context.stroke();

    // Draw target point
    context.beginPath();
    context.arc(targetX, targetY, 5, 0, 2 * Math.PI);
    context.fillStyle = lookingAway ? 'red' : 'green';
    context.fill();
  };

  // Set up interval for eye tracking
  useEffect(() => {
    const intervalId = setInterval(processVideoFrame, trackingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isProcessing, trackingInterval]);

  return (
    <div className="relative">
      {/* Canvas for eye tracking visualization */}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto rounded-lg ${showVisualization ? 'block' : 'hidden'}`}
      />

      {/* Status indicator */}
      {trackingResult && (
        <div className="absolute top-2 right-2 flex items-center bg-gray-900 bg-opacity-70 rounded-lg px-3 py-1.5 text-white text-sm">
          {trackingResult.eyesDetected ? (
            trackingResult.lookingAway ? (
              <>
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
                <span>{t('proctoring.lookingAway')}</span>
              </>
            ) : (
              <>
                <EyeIcon className="h-5 w-5 text-green-500 mr-1.5" />
                <span>{t('proctoring.lookingAtScreen')}</span>
              </>
            )
          ) : (
            <>
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1.5" />
              <span>{t('proctoring.eyesNotDetected')}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EyeTracking;
