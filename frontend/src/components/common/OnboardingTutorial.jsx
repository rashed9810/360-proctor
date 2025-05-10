import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Simple tutorial modal that doesn't depend on react-joyride
const OnboardingTutorial = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: t('tutorial.welcome'),
      content: t('tutorial.welcomeStep'),
      target: 'dashboard-welcome',
    },
    {
      title: t('tutorial.stats'),
      content: t('tutorial.statsStep'),
      target: 'stats-section',
    },
    {
      title: t('tutorial.liveProctor'),
      content: t('tutorial.liveProctorStep'),
      target: 'live-proctoring-section',
    },
    {
      title: t('tutorial.trustScore'),
      content: t('tutorial.trustScoreStep'),
      target: 'trust-score-section',
    },
    {
      title: t('tutorial.upcomingExams'),
      content: t('tutorial.upcomingExamsStep'),
      target: 'upcoming-exams-section',
    },
    {
      title: t('tutorial.notifications'),
      content: t('tutorial.notificationsStep'),
      target: 'notification-bell',
    },
    {
      title: t('tutorial.language'),
      content: t('tutorial.languageStep'),
      target: 'language-switcher',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{steps[currentStep].title}</h3>
          <button onClick={handleSkip} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700">{steps[currentStep].content}</p>

          <div className="mt-4 text-sm text-gray-500">
            {t('tutorial.step')} {currentStep + 1} {t('tutorial.of')} {steps.length}
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 flex justify-between rounded-b-lg">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {t('tutorial.back')}
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {t('tutorial.skip')}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              {currentStep < steps.length - 1 ? t('tutorial.next') : t('tutorial.finish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
