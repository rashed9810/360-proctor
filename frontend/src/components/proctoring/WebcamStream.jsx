import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { VideoCameraIcon, VideoCameraSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * WebcamStream component for accessing and displaying the user's webcam
 * @param {Object} props - Component props
 * @param {Function} props.onStream - Callback function that receives the video stream
 * @param {Function} props.onError - Callback function that receives any errors
 * @param {boolean} props.autoStart - Whether to automatically start the webcam
 * @param {string} props.width - Width of the video element
 * @param {string} props.height - Height of the video element
 * @param {boolean} props.mirrored - Whether to mirror the video horizontally
 * @param {boolean} props.showControls - Whether to show camera controls
 */
const WebcamStream = ({
  onStream,
  onError,
  autoStart = true,
  width = '100%',
  height = 'auto',
  mirrored = true,
  showControls = true,
}) => {
  const { t } = useTranslation('proctoring');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [isLoading, setIsLoading] = useState(autoStart);
  const [hasPermission, setHasPermission] = useState(true);
  const [error, setError] = useState(null);

  // Start webcam stream
  const startWebcam = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setHasPermission(true);

        if (onStream) {
          onStream(stream);
        }
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setIsActive(false);
      setError(err.message);
      setHasPermission(err.name !== 'NotAllowedError');

      if (onError) {
        onError(err);
      }

      // Show user-friendly error message
      if (err.name === 'NotAllowedError') {
        toast.error(t('cameraPermissionDenied'));
      } else if (err.name === 'NotFoundError') {
        toast.error(t('cameraNotFound'));
      } else {
        toast.error(t('cameraError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      streamRef.current = null;
      setIsActive(false);
    }
  };

  // Toggle webcam state
  const toggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Start webcam on mount if autoStart is true
  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }

    // Cleanup on unmount
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-900">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width,
          height,
          transform: mirrored ? 'scaleX(-1)' : 'none',
          display: isActive && !isLoading ? 'block' : 'none',
        }}
        className="rounded-lg"
        onLoadedMetadata={() => setIsLoading(false)}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <ArrowPathIcon className="h-8 w-8 text-white" />
          </motion.div>
          <span className="ml-2 text-white">{t('initializingCamera')}</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
          <VideoCameraSlashIcon className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-white text-center mb-4">
            {!hasPermission ? t('cameraPermissionDenied') : t('cameraError')}
          </p>
          <button
            onClick={startWebcam}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('retryCamera')}
          </button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button
            onClick={toggleWebcam}
            className={`p-2 rounded-full ${
              isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
            aria-label={isActive ? t('stopCamera') : t('startCamera')}
          >
            {isActive ? (
              <VideoCameraSlashIcon className="h-5 w-5" />
            ) : (
              <VideoCameraIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamStream;
