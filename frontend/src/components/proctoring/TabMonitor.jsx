import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * TabMonitor component for detecting tab switching and window focus changes
 * @param {Object} props - Component props
 * @param {Function} props.onTabSwitch - Callback when tab is switched
 * @param {Function} props.onWindowBlur - Callback when window loses focus
 * @param {Function} props.onFullscreenExit - Callback when fullscreen is exited
 * @param {boolean} props.enforceFullscreen - Whether to enforce fullscreen mode
 * @param {boolean} props.showWarnings - Whether to show warning messages
 * @param {number} props.timeRemaining - Time remaining in the exam (in milliseconds)
 * @param {number} props.totalExamTime - Total exam time (in milliseconds)
 */
const TabMonitor = ({
  onTabSwitch,
  onWindowBlur,
  onFullscreenExit,
  enforceFullscreen = false,
  showWarnings = true,
  timeRemaining = null,
  totalExamTime = 3600000, // Default 1 hour
}) => {
  const { t } = useTranslation('proctoring');
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [warnings, setWarnings] = useState([]);

  // Track tab visibility duration for enhanced monitoring
  const [tabVisibilityHistory, setTabVisibilityHistory] = useState([]);
  const [lastVisibilityChange, setLastVisibilityChange] = useState(new Date());

  // Enhanced tab visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentTime = new Date();
      const duration = currentTime - lastVisibilityChange;

      // Record the visibility change with duration
      setTabVisibilityHistory(prev => [
        ...prev,
        {
          wasVisible: !document.hidden, // Previous state
          timestamp: currentTime,
          duration: duration,
        },
      ]);

      // Update last change timestamp
      setLastVisibilityChange(currentTime);

      if (document.hidden) {
        // Tab is now hidden (user switched tabs)
        const timestamp = new Date();
        setTabSwitchCount(prev => prev + 1);

        // Create enhanced warning with more details
        const warning = {
          id: `tab-${timestamp.getTime()}`,
          type: 'tabSwitch',
          message: t('tabSwitchDetected'),
          timestamp,
          severity: 'high', // Tab switching is considered high severity
          visibleDuration: duration, // How long the tab was visible before switching
        };

        setWarnings(prev => [warning, ...prev]);

        if (onTabSwitch) {
          onTabSwitch({
            count: tabSwitchCount + 1,
            timestamp,
            visibleDuration: duration,
            history: [
              ...tabVisibilityHistory,
              {
                wasVisible: true,
                timestamp: currentTime,
                duration: duration,
              },
            ],
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabSwitchCount, onTabSwitch, tabVisibilityHistory, lastVisibilityChange]);

  // Track window focus state with enhanced detection
  const [windowFocusHistory, setWindowFocusHistory] = useState([]);
  const [lastFocusChange, setLastFocusChange] = useState(new Date());
  const [consecutiveBlurs, setConsecutiveBlurs] = useState(0);

  // Enhanced window focus/blur detection
  useEffect(() => {
    const handleWindowFocus = () => {
      const currentTime = new Date();
      const blurDuration = currentTime - lastFocusChange;

      // Record focus change with duration
      setWindowFocusHistory(prev => [
        ...prev,
        {
          wasFocused: false, // Previous state
          timestamp: currentTime,
          duration: blurDuration,
        },
      ]);

      setIsWindowFocused(true);
      setLastFocusChange(currentTime);
      setConsecutiveBlurs(0); // Reset consecutive blur count
    };

    const handleWindowBlur = () => {
      const currentTime = new Date();
      const focusDuration = currentTime - lastFocusChange;

      // Record blur with duration
      setWindowFocusHistory(prev => [
        ...prev,
        {
          wasFocused: true, // Previous state
          timestamp: currentTime,
          duration: focusDuration,
        },
      ]);

      setIsWindowFocused(false);
      setLastFocusChange(currentTime);

      // Increment consecutive blur count for severity calculation
      const newConsecutiveBlurs = consecutiveBlurs + 1;
      setConsecutiveBlurs(newConsecutiveBlurs);

      // Calculate severity based on consecutive blurs and duration patterns
      let severity = 'medium';
      if (newConsecutiveBlurs >= 3) {
        severity = 'high';
      } else if (windowFocusHistory.length >= 2) {
        // Check for suspicious patterns (frequent short focus periods)
        const recentFocusPeriods = windowFocusHistory.filter(h => h.wasFocused).slice(-3);

        if (recentFocusPeriods.length >= 2 && recentFocusPeriods.every(p => p.duration < 5000)) {
          // Multiple short focus periods (less than 5 seconds) are suspicious
          severity = 'high';
        }
      }

      const timestamp = new Date();
      setWindowBlurCount(prev => prev + 1);

      // Enhanced warning with more details
      const warning = {
        id: `blur-${timestamp.getTime()}`,
        type: 'windowBlur',
        message: t('windowBlurDetected'),
        timestamp,
        severity,
        focusDuration,
        consecutiveCount: newConsecutiveBlurs,
      };

      setWarnings(prev => [warning, ...prev]);

      if (onWindowBlur) {
        onWindowBlur({
          count: windowBlurCount + 1,
          timestamp,
          severity,
          focusDuration,
          consecutiveCount: newConsecutiveBlurs,
          history: [
            ...windowFocusHistory,
            {
              wasFocused: true,
              timestamp: currentTime,
              duration: focusDuration,
            },
          ],
        });
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [windowBlurCount, onWindowBlur, windowFocusHistory, lastFocusChange, consecutiveBlurs]);

  // Track fullscreen state with enhanced detection
  const [fullscreenHistory, setFullscreenHistory] = useState([]);
  const [lastFullscreenChange, setLastFullscreenChange] = useState(new Date());
  const [fullscreenDuration, setFullscreenDuration] = useState(0);

  // Enhanced fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      const currentTime = new Date();
      const duration = currentTime - lastFullscreenChange;

      // Record fullscreen change with duration
      setFullscreenHistory(prev => [
        ...prev,
        {
          wasFullscreen: isFullscreen, // Previous state
          timestamp: currentTime,
          duration: duration,
        },
      ]);

      setLastFullscreenChange(currentTime);

      // Update fullscreen state
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isFullscreen) {
        // Fullscreen was exited
        const timestamp = new Date();
        setFullscreenExitCount(prev => prev + 1);

        // Calculate how long the user was in fullscreen mode
        if (isFullscreen) {
          setFullscreenDuration(prev => prev + duration);
        }

        // Determine severity based on exam context
        // Early exits are more suspicious than later ones
        const examProgress = timeRemaining ? 1 - timeRemaining / totalExamTime : 0.5;
        const severity = examProgress < 0.2 ? 'high' : examProgress < 0.8 ? 'medium' : 'low';

        const warning = {
          id: `fs-${timestamp.getTime()}`,
          type: 'fullscreenExit',
          message: t('fullscreenExitDetected'),
          timestamp,
          severity,
          fullscreenDuration: duration,
          examProgress: Math.round(examProgress * 100),
        };

        setWarnings(prev => [warning, ...prev]);

        if (onFullscreenExit) {
          onFullscreenExit({
            count: fullscreenExitCount + 1,
            timestamp,
            severity,
            fullscreenDuration: duration,
            examProgress: Math.round(examProgress * 100),
            history: fullscreenHistory,
          });
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [
    isFullscreen,
    fullscreenExitCount,
    onFullscreenExit,
    fullscreenHistory,
    lastFullscreenChange,
  ]);

  // Request fullscreen if enforced
  useEffect(() => {
    if (enforceFullscreen && !isFullscreen) {
      requestFullscreen();
    }
  }, [enforceFullscreen, isFullscreen]);

  // Request fullscreen
  const requestFullscreen = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  };

  // Clear warnings
  const clearWarnings = () => {
    setWarnings([]);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('tabMonitor')}</h3>

        <div className="flex space-x-2">
          {/* Fullscreen button */}
          <button
            onClick={requestFullscreen}
            className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-opacity-80 transition-colors"
            aria-label={t('enterFullscreen')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Clear warnings button */}
          {warnings.length > 0 && (
            <button
              onClick={clearWarnings}
              className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-opacity-80 transition-colors"
              aria-label={t('clearWarnings')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center mb-1">
            <DocumentDuplicateIcon className="h-5 w-5 text-blue-500 mr-1.5" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tabSwitches')}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${tabSwitchCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
          >
            {tabSwitchCount}
          </span>
        </div>

        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-500 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('windowBlurs')}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${windowBlurCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
          >
            {windowBlurCount}
          </span>
        </div>

        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-500 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('fullscreenExits')}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${fullscreenExitCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
          >
            {fullscreenExitCount}
          </span>
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md mb-4">
        {isWindowFocused ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {isWindowFocused ? t('windowFocused') : t('windowNotFocused')}
        </span>

        <div className="mx-4 h-4 border-l border-gray-300 dark:border-gray-700"></div>

        {isFullscreen ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {isFullscreen ? t('fullscreenMode') : t('notFullscreen')}
        </span>
      </div>

      {/* Enhanced warning list with severity indicators and detailed information */}
      {showWarnings && warnings.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('recentWarnings')}
            </h4>

            {/* Warning count by severity */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {warnings.filter(w => w.severity === 'high').length}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {warnings.filter(w => w.severity === 'medium' || !w.severity).length}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {warnings.filter(w => w.severity === 'low').length}
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-[200px] overflow-y-auto">
            {warnings.slice(0, 10).map(warning => (
              <motion.div
                key={warning.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start p-3 mb-2 rounded-md border-l-4 ${
                  warning.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : warning.severity === 'medium' || !warning.severity
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <ExclamationTriangleIcon
                  className={`h-5 w-5 mr-2 mt-0.5 ${
                    warning.severity === 'high'
                      ? 'text-red-500'
                      : warning.severity === 'medium' || !warning.severity
                        ? 'text-yellow-500'
                        : 'text-blue-500'
                  }`}
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {warning.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(warning.timestamp)}
                    </div>
                  </div>

                  {/* Additional warning details */}
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {warning.type === 'windowBlur' && warning.focusDuration && (
                      <div>
                        {t('focusDuration')}: {Math.round(warning.focusDuration / 1000)}s
                        {warning.consecutiveCount > 1 && (
                          <span className="ml-2">
                            ({warning.consecutiveCount} {t('consecutive')})
                          </span>
                        )}
                      </div>
                    )}

                    {warning.type === 'tabSwitch' && warning.visibleDuration && (
                      <div>
                        {t('visibleDuration')}: {Math.round(warning.visibleDuration / 1000)}s
                      </div>
                    )}

                    {warning.type === 'fullscreenExit' && (
                      <div className="flex flex-col space-y-1">
                        <div>{t('fullscreenExitWarning')}</div>
                        {warning.fullscreenDuration && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">{t('fullscreenDuration')}:</span>
                            {Math.round(warning.fullscreenDuration / 1000)}s
                          </div>
                        )}
                        {warning.examProgress !== undefined && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">{t('examProgress')}:</span>
                            <div className="ml-1 w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${warning.examProgress}%` }}
                              />
                            </div>
                            <span className="ml-1">{warning.examProgress}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabMonitor;
