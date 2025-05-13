import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Enhanced speech recognition service with better error handling and fallbacks
const enhancedSpeechRecognition = () => {
  // Force fallback mode for testing and development
  // Set this to true to always use the fallback mode regardless of browser support
  const forceFallbackMode = false;

  // Check if browser supports speech recognition
  const hasSpeechRecognition = 'SpeechRecognition' in window;
  const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;

  // Check if browser is Chrome, which is known to support speech recognition
  const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  // Check if browser is Firefox, which has limited support
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
  // Check if browser is Safari, which has limited support
  const isSafari = navigator.userAgent.indexOf('Safari') > -1 && !isChrome;
  // Check if browser is Edge, which has good support
  const isEdge = navigator.userAgent.indexOf('Edg') > -1;

  // Log browser detection for debugging
  console.log('Browser detection:', { isChrome, isFirefox, isSafari, isEdge });
  console.log('Speech Recognition support:', { hasSpeechRecognition, hasWebkitSpeechRecognition });

  // If we're forcing fallback mode or the browser doesn't support speech recognition
  if (forceFallbackMode || (!hasSpeechRecognition && !hasWebkitSpeechRecognition)) {
    console.warn('Speech Recognition API not supported in this browser or fallback mode forced');

    // Provide more specific error based on browser
    let specificError = 'speechRecognitionNotSupported';
    if (isFirefox) {
      specificError = 'firefoxSpeechRecognitionLimited';
    } else if (isSafari) {
      specificError = 'safariSpeechRecognitionLimited';
    } else if (forceFallbackMode) {
      specificError = 'fallbackModeEnabled';
    }

    return {
      recognition: null,
      error: specificError,
      browserSupport: {
        native: hasSpeechRecognition,
        webkit: hasWebkitSpeechRecognition,
        browser: isChrome
          ? 'chrome'
          : isFirefox
            ? 'firefox'
            : isSafari
              ? 'safari'
              : isEdge
                ? 'edge'
                : 'other',
      },
      fallbackMode: true,
    };
  }

  try {
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition with enhanced settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
    recognition.lang = 'en-US'; // Default language

    // Test if the recognition instance is valid by accessing a property
    // This can catch some initialization errors early
    if (!recognition || typeof recognition.start !== 'function') {
      throw new Error('Speech recognition instance is invalid');
    }

    // Add additional properties for enhanced functionality
    return {
      recognition,
      error: null,
      browserSupport: {
        native: hasSpeechRecognition,
        webkit: hasWebkitSpeechRecognition,
        browser: isChrome
          ? 'chrome'
          : isFirefox
            ? 'firefox'
            : isSafari
              ? 'safari'
              : isEdge
                ? 'edge'
                : 'other',
      },
      isWebkit: hasWebkitSpeechRecognition && !hasSpeechRecognition,
      fallbackMode: false,
    };
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return {
      recognition: null,
      error: 'initializationError',
      errorDetails: error.message,
      browserSupport: {
        native: hasSpeechRecognition,
        webkit: hasWebkitSpeechRecognition,
        browser: isChrome
          ? 'chrome'
          : isFirefox
            ? 'firefox'
            : isSafari
              ? 'safari'
              : isEdge
                ? 'edge'
                : 'other',
      },
      fallbackMode: true,
    };
  }
};

// Enhanced audio analysis with improved detection and context awareness
const enhancedAudioAnalysis = (transcript, previousTranscripts = []) => {
  if (!transcript || transcript.trim() === '') {
    return {
      hasSuspiciousKeywords: false,
      detectedKeywords: [],
      confidence: 0,
      context: 'empty',
      severity: 'none',
    };
  }

  // Categorized suspicious keywords with severity levels
  const suspiciousKeywords = {
    high: [
      'answer key',
      'cheat sheet',
      'tell me the answer',
      'solve this for me',
      'what is the solution',
      'give me answers',
      'show me answers',
    ],
    medium: [
      'google',
      'search',
      'look up',
      'find online',
      'check online',
      'answer',
      'solution',
      'cheat',
      'help me with this',
    ],
    low: ['what is', 'tell me', 'help', 'not sure', "don't know", 'confused', 'stuck', 'difficult'],
  };

  // Combine all transcripts for context analysis
  const fullContext = [...previousTranscripts, transcript].join(' ').toLowerCase();
  const currentTranscript = transcript.toLowerCase();

  // Detect keywords by severity
  const detectedKeywords = {
    high: suspiciousKeywords.high.filter(keyword =>
      currentTranscript.includes(keyword.toLowerCase())
    ),
    medium: suspiciousKeywords.medium.filter(keyword =>
      currentTranscript.includes(keyword.toLowerCase())
    ),
    low: suspiciousKeywords.low.filter(keyword =>
      currentTranscript.includes(keyword.toLowerCase())
    ),
  };

  // Determine overall severity
  let severity = 'none';
  if (detectedKeywords.high.length > 0) {
    severity = 'high';
  } else if (detectedKeywords.medium.length > 0) {
    severity = 'medium';
  } else if (detectedKeywords.low.length > 0) {
    severity = 'low';
  }

  // Calculate confidence based on keyword matches and context
  let confidence = 0;
  if (severity !== 'none') {
    // Base confidence on severity
    const baseConfidence = severity === 'high' ? 0.9 : severity === 'medium' ? 0.7 : 0.5;

    // Adjust for repeated keywords in context (increases confidence)
    const contextFactor = previousTranscripts.length > 0 ? 0.1 : 0;

    // Adjust for multiple keywords in same category (increases confidence)
    const keywordCountFactor = Math.min(
      0.1,
      detectedKeywords.high.length * 0.05 +
        detectedKeywords.medium.length * 0.03 +
        detectedKeywords.low.length * 0.01
    );

    confidence = Math.min(0.99, baseConfidence + contextFactor + keywordCountFactor);
  }

  // Combine all detected keywords
  const allDetectedKeywords = [
    ...detectedKeywords.high,
    ...detectedKeywords.medium,
    ...detectedKeywords.low,
  ];

  return {
    hasSuspiciousKeywords: allDetectedKeywords.length > 0,
    detectedKeywords: allDetectedKeywords,
    keywordsBySeverity: detectedKeywords,
    confidence,
    severity,
    context: previousTranscripts.length > 0 ? 'conversation' : 'single',
    timestamp: new Date().toISOString(),
    transcriptLength: transcript.length,
  };
};

/**
 * AudioAnalysis component for speech-to-text and audio monitoring
 * @param {Object} props - Component props
 * @param {Function} props.onSpeechDetected - Callback when speech is detected
 * @param {Function} props.onSuspiciousSpeech - Callback when suspicious speech is detected
 * @param {boolean} props.autoStart - Whether to automatically start audio recording
 * @param {string} props.language - Language code for speech recognition
 * @param {boolean} props.showTranscript - Whether to show the speech transcript
 */
const AudioAnalysis = ({
  onSpeechDetected,
  onSuspiciousSpeech,
  autoStart = true,
  language = 'en-US',
  showTranscript = true,
}) => {
  const { t, i18n } = useTranslation('proctoring');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);

  // Store previous transcripts for context analysis
  const previousTranscriptsRef = useRef([]);

  // Initialize speech recognition with enhanced error handling
  useEffect(() => {
    // Try to create speech recognition instance with enhanced error handling
    try {
      const result = enhancedSpeechRecognition();

      // Set fallback mode based on the result
      setFallbackMode(result.fallbackMode || false);

      if (result.error) {
        setError(result.error);
        console.warn(
          `Speech recognition initialization failed: ${result.error}`,
          result.errorDetails || ''
        );

        // Show appropriate error message based on browser support
        if (
          result.error === 'speechRecognitionNotSupported' ||
          result.error === 'firefoxSpeechRecognitionLimited' ||
          result.error === 'safariSpeechRecognitionLimited'
        ) {
          toast.error(t(`errors.${result.error}`), {
            duration: 5000,
            icon: '🎤',
          });
        }
        return;
      }

      recognitionRef.current = result.recognition;

      // Set recognition language based on current app language or prop
      const recognitionLanguage = language || (i18n.language === 'bn' ? 'bn-BD' : 'en-US');

      recognitionRef.current.lang = recognitionLanguage;

      // Set up recognition event handlers
      recognitionRef.current.onresult = event => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;

            // Store transcript for context analysis
            previousTranscriptsRef.current.push(finalTranscript);

            // Keep only the last 5 transcripts for context
            if (previousTranscriptsRef.current.length > 5) {
              previousTranscriptsRef.current.shift();
            }

            return newTranscript;
          });

          // Analyze speech for suspicious content with enhanced analysis
          const result = enhancedAudioAnalysis(finalTranscript, previousTranscriptsRef.current);
          setAnalysis(result);

          if (result.hasSuspiciousKeywords && onSuspiciousSpeech) {
            // Enhanced callback with more detailed information
            onSuspiciousSpeech({
              transcript: finalTranscript,
              keywords: result.detectedKeywords,
              keywordsBySeverity: result.keywordsBySeverity,
              confidence: result.confidence,
              severity: result.severity,
              timestamp: result.timestamp,
            });

            // Show toast notification for high severity violations
            if (result.severity === 'high') {
              toast.error(t('highSeveritySpeechDetected'), {
                duration: 5000,
                icon: '⚠️',
              });
            } else if (result.severity === 'medium') {
              toast(t('mediumSeveritySpeechDetected'), {
                duration: 4000,
                icon: '⚠️',
                style: {
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #F59E0B',
                },
              });
            }
          }

          if (onSpeechDetected) {
            onSpeechDetected(finalTranscript);
          }
        }

        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = event => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);

        if (event.error === 'not-allowed') {
          toast.error(t('microphonePermissionDenied'));
        } else {
          toast.error(t('speechRecognitionError'));
        }
      };

      // Auto-start if enabled
      if (autoStart) {
        startRecording();
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('initializationError');
    }

    // Clean up on unmount
    return () => {
      stopRecording();
    };
  }, []);

  // Initialize audio context for volume detection
  useEffect(() => {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Get microphone access
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(stream => {
          microphoneStreamRef.current = stream;

          // Create analyzer
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;

          // Connect microphone to analyzer
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);

          // Start monitoring volume
          monitorVolume();
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          setError('microphoneAccessDenied');

          if (err.name === 'NotAllowedError') {
            toast.error(t('microphonePermissionDenied'));
          } else {
            toast.error(t('microphoneError'));
          }
        });
    } catch (err) {
      console.error('Error initializing audio context:', err);
      setError('audioContextError');
    }

    // Clean up on unmount
    return () => {
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Monitor microphone volume
  const monitorVolume = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }

      const avgVolume = sum / bufferLength;
      const normalizedVolume = avgVolume / 255; // Normalize to 0-1

      setVolume(normalizedVolume);

      // Determine if user is speaking (volume threshold)
      setIsSpeaking(normalizedVolume > 0.1);

      // Continue monitoring
      requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  // Start recording audio
  const startRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('startError');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setManualInput('');
    setAnalysis(null);
  };

  // Handle manual text input for fallback mode
  const handleManualInputChange = e => {
    setManualInput(e.target.value);
  };

  // Submit manual text input for analysis
  const handleManualInputSubmit = () => {
    if (!manualInput.trim()) return;

    // Add the manual input to the transcript
    const newTranscript = transcript + manualInput + ' ';
    setTranscript(newTranscript);

    // Store for context analysis
    previousTranscriptsRef.current.push(manualInput);

    // Keep only the last 5 transcripts for context
    if (previousTranscriptsRef.current.length > 5) {
      previousTranscriptsRef.current.shift();
    }

    // Analyze the manual input
    const result = enhancedAudioAnalysis(manualInput, previousTranscriptsRef.current);
    setAnalysis(result);

    // Call the callbacks
    if (onSpeechDetected) {
      onSpeechDetected(manualInput);
    }

    if (result.hasSuspiciousKeywords && onSuspiciousSpeech) {
      onSuspiciousSpeech({
        transcript: manualInput,
        keywords: result.detectedKeywords,
        keywordsBySeverity: result.keywordsBySeverity,
        confidence: result.confidence,
        severity: result.severity,
        timestamp: result.timestamp,
      });

      // Show toast notification for high severity violations
      if (result.severity === 'high') {
        toast.error(t('highSeveritySpeechDetected'), {
          duration: 5000,
          icon: '⚠️',
        });
      } else if (result.severity === 'medium') {
        toast(t('mediumSeveritySpeechDetected'), {
          duration: 4000,
          icon: '⚠️',
          style: {
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
          },
        });
      }
    }

    // Clear the input field
    setManualInput('');
  };

  // Handle key press for manual input
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleManualInputSubmit();
    }
  };

  // Determine if we should show the fallback UI
  const showFallbackUI =
    fallbackMode ||
    error === 'speechRecognitionNotSupported' ||
    error === 'firefoxSpeechRecognitionLimited' ||
    error === 'safariSpeechRecognitionLimited';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('audioAnalysis')}</h3>

        <div className="flex space-x-2">
          {/* Volume indicator - only show if not in fallback mode */}
          {!showFallbackUI && (
            <div className="flex items-center">
              {isSpeaking ? (
                <SpeakerWaveIcon className="h-5 w-5 text-green-500" />
              ) : (
                <SpeakerXMarkIcon className="h-5 w-5 text-gray-400" />
              )}

              <div className="ml-1 w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-gray-400'}`}
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Recording toggle button - only show if not in fallback mode */}
          {!showFallbackUI && (
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-full ${
                isRecording
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              } hover:bg-opacity-80 transition-colors`}
              aria-label={isRecording ? t('stopRecording') : t('startRecording')}
            >
              <MicrophoneIcon className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          )}

          {/* Clear transcript button - only show if not in fallback mode and there's a transcript */}
          {!showFallbackUI && transcript && (
            <button
              onClick={clearTranscript}
              className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-opacity-80 transition-colors"
              aria-label={t('clearTranscript')}
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error message with more detailed information */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md text-sm">
          {t(`errors.${error}`, { defaultValue: t('errors.unknown') })}

          {/* Show browser-specific help for speech recognition issues */}
          {(error === 'speechRecognitionNotSupported' ||
            error === 'firefoxSpeechRecognitionLimited' ||
            error === 'safariSpeechRecognitionLimited') && (
            <div className="mt-2 text-xs">
              <p>{t('errors.browserSuggestion')}</p>
              <ul className="list-disc pl-4 mt-1">
                <li>{t('errors.tryChrome')}</li>
                <li>{t('errors.checkMicrophonePermissions')}</li>
                <li>{t('errors.refreshPage')}</li>
              </ul>
              <p className="mt-2">{t('errors.fallbackModeEnabled')}</p>
            </div>
          )}

          {/* Show help for microphone access issues */}
          {(error === 'microphoneAccessDenied' || error === 'microphoneError') && (
            <div className="mt-2 text-xs">
              <p>{t('errors.microphoneSuggestion')}</p>
              <ul className="list-disc pl-4 mt-1">
                <li>{t('errors.allowMicrophoneAccess')}</li>
                <li>{t('errors.checkMicrophoneConnected')}</li>
                <li>{t('errors.refreshPage')}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Manual text input for fallback mode */}
      {showFallbackUI && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={manualInput}
              onChange={handleManualInputChange}
              onKeyPress={handleKeyPress}
              placeholder={t('errors.typeTextHere')}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label={t('errors.manualTextInput')}
            />
            <button
              onClick={handleManualInputSubmit}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              aria-label={t('errors.submitText')}
            >
              {t('errors.submit')}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('errors.manualInputInstructions')}
          </p>
        </div>
      )}

      {/* Transcript display */}
      {showTranscript && (
        <div className="mt-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('transcript')}:</div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto text-sm">
            {transcript ? (
              <div>
                <span className="text-gray-800 dark:text-gray-200">{transcript}</span>
                <span className="text-gray-400 dark:text-gray-500">{interimTranscript}</span>
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 italic">
                {isRecording ? t('listeningForSpeech') : t('noSpeechDetected')}
              </div>
            )}
          </div>

          {/* Enhanced analysis results with severity levels */}
          {analysis && analysis.hasSuspiciousKeywords && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-2 p-3 rounded-md text-xs ${
                analysis.severity === 'high'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-l-4 border-red-500'
                  : analysis.severity === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-l-4 border-yellow-500'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{t(`${analysis.severity}SeveritySpeechDetected`)}</div>
                <div className="text-xs opacity-70">
                  {new Date(analysis.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {analysis.keywordsBySeverity &&
                  analysis.keywordsBySeverity.high &&
                  analysis.keywordsBySeverity.high.length > 0 && (
                    <div>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {t('highSeverityKeywords')}:
                      </span>{' '}
                      {analysis.keywordsBySeverity.high.join(', ')}
                    </div>
                  )}

                {analysis.keywordsBySeverity &&
                  analysis.keywordsBySeverity.medium &&
                  analysis.keywordsBySeverity.medium.length > 0 && (
                    <div>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        {t('mediumSeverityKeywords')}:
                      </span>{' '}
                      {analysis.keywordsBySeverity.medium.join(', ')}
                    </div>
                  )}

                {analysis.keywordsBySeverity &&
                  analysis.keywordsBySeverity.low &&
                  analysis.keywordsBySeverity.low.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {t('lowSeverityKeywords')}:
                      </span>{' '}
                      {analysis.keywordsBySeverity.low.join(', ')}
                    </div>
                  )}
              </div>

              <div className="mt-2 flex items-center">
                <span className="text-xs opacity-70">{t('confidence')}:</span>
                <div className="ml-2 w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      analysis.confidence > 0.8
                        ? 'bg-red-500'
                        : analysis.confidence > 0.6
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${analysis.confidence * 100}%` }}
                  />
                </div>
                <span className="ml-1 text-xs font-medium">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioAnalysis;
