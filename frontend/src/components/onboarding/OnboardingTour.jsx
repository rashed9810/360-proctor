import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Onboarding tour component for new users
 * @param {Object} props - Component props
 * @param {boolean} props.isNewUser - Whether the user is new
 * @param {Function} props.onComplete - Function to call when tour is completed
 * @param {boolean} props.enabled - Whether the tour is enabled
 */
const OnboardingTour = ({ isNewUser = false, onComplete, enabled = true }) => {
  const { t } = useTranslation();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Define tour steps
  const tourSteps = [
    {
      target: '#dashboard-stats',
      title: t('onboarding.dashboardStats.title'),
      content: t('onboarding.dashboardStats.content'),
      position: 'bottom',
    },
    {
      target: '#upcoming-exams',
      title: t('onboarding.upcomingExams.title'),
      content: t('onboarding.upcomingExams.content'),
      position: 'top',
    },
    {
      target: '#notification-bell',
      title: t('onboarding.notifications.title'),
      content: t('onboarding.notifications.content'),
      position: 'bottom',
    },
    {
      target: '#quick-actions',
      title: t('onboarding.quickActions.title'),
      content: t('onboarding.quickActions.content'),
      position: 'left',
    },
    {
      target: '#theme-toggle',
      title: t('onboarding.themeToggle.title'),
      content: t('onboarding.themeToggle.content'),
      position: 'bottom',
    },
  ];

  // Initialize tour for new users
  useEffect(() => {
    if (isNewUser && enabled && !tourCompleted) {
      // Delay the start of the tour to ensure elements are rendered
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewUser, enabled, tourCompleted]);

  // Get target element position
  const getTargetPosition = (targetId) => {
    const element = document.querySelector(targetId);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom + window.scrollY,
      right: rect.right + window.scrollX,
    };
  };

  // Calculate tooltip position
  const calculateTooltipPosition = (targetPosition, position) => {
    if (!targetPosition) return { top: '50%', left: '50%' };
    
    switch (position) {
      case 'top':
        return {
          top: `${targetPosition.top - 10}px`,
          left: `${targetPosition.left + targetPosition.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${targetPosition.bottom + 10}px`,
          left: `${targetPosition.left + targetPosition.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${targetPosition.top + targetPosition.height / 2}px`,
          left: `${targetPosition.left - 10}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${targetPosition.top + targetPosition.height / 2}px`,
          left: `${targetPosition.right + 10}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: `${targetPosition.bottom + 10}px`,
          left: `${targetPosition.left + targetPosition.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Complete the tour
  const completeTour = () => {
    setShowTour(false);
    setTourCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  // Skip the tour
  const skipTour = () => {
    setShowTour(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Restart the tour
  const restartTour = () => {
    setCurrentStep(0);
    setShowTour(true);
    setTourCompleted(false);
  };

  // Current step data
  const currentStepData = tourSteps[currentStep];
  const targetPosition = currentStepData ? getTargetPosition(currentStepData.target) : null;
  const tooltipPosition = currentStepData ? calculateTooltipPosition(targetPosition, currentStepData.position) : {};

  // Highlight target element
  const highlightTarget = () => {
    if (!targetPosition) return null;
    
    return (
      <div
        className="absolute bg-indigo-500 bg-opacity-30 border-2 border-indigo-500 rounded-lg z-40 pointer-events-none"
        style={{
          top: targetPosition.top,
          left: targetPosition.left,
          width: targetPosition.width,
          height: targetPosition.height,
        }}
      />
    );
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!currentStepData) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-4 w-80"
        style={tooltipPosition}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {currentStepData.title}
          </h3>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {currentStepData.content}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentStep
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                {t('previous')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  {t('next')}
                  <ArrowRightIcon className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  {t('finish')}
                  <CheckCircleIcon className="h-3 w-3 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render overlay
  const renderOverlay = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={skipTour} />
    );
  };

  // Render restart button
  const renderRestartButton = () => {
    if (!tourCompleted || showTour) return null;
    
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={restartTour}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('restartTour')}
        </button>
      </div>
    );
  };

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {showTour && (
          <>
            {renderOverlay()}
            {highlightTarget()}
            {renderTooltip()}
          </>
        )}
      </AnimatePresence>
      {renderRestartButton()}
    </>
  );
};

export default OnboardingTour;
