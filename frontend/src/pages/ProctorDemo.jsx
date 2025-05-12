import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import ProctorView from '../components/proctoring/ProctorView';
import PageHeader from '../components/layout/PageHeader';
import toast from 'react-hot-toast';

export default function ProctorDemo() {
  const { t } = useTranslation('proctoring');
  const [trustScore, setTrustScore] = useState(100);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [violations, setViolations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle trust score update
  const handleTrustScoreUpdate = score => {
    setTrustScore(score);
  };

  // Handle violation detection
  const handleViolation = (violation, allViolations) => {
    setViolations(allViolations);

    // Show toast for high severity violations
    if (violation.severity === 'high') {
      toast.error(t(`violations.${violation.type}`));
    }
  };

  // Enter fullscreen mode
  const enterFullscreen = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
      toast.error(t('fullscreenError'));
    }
  };

  // Get trust score color
  const getTrustScoreColor = () => {
    if (trustScore >= 80) return 'text-green-500';
    if (trustScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get trust score label
  const getTrustScoreLabel = () => {
    if (trustScore >= 80) return t('trustScoreHigh');
    if (trustScore >= 60) return t('trustScoreMedium');
    return t('trustScoreLow');
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        showBackButton={true}
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
              {showDebugInfo ? t('hideDebugInfo') : t('showDebugInfo')}
            </button>

            <button
              onClick={enterFullscreen}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t('enterFullscreen')}
            </button>
          </div>
        }
      />

      {/* Instructions */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {t('instructions')}
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <p>{t('instructionsText')}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>{t('instruction1')}</li>
                <li>{t('instruction2')}</li>
                <li>{t('instruction3')}</li>
                <li>{t('instruction4')}</li>
                <li>{t('instruction5')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust score card */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className={`h-8 w-8 ${getTrustScoreColor()} mr-3`} />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('trustScore')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getTrustScoreLabel()}</p>
              </div>
            </div>

            <div className="text-3xl font-bold ${getTrustScoreColor()}">{trustScore}</div>
          </div>

          {/* Trust score progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  trustScore >= 80
                    ? 'bg-green-500'
                    : trustScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${trustScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring view */}
      <ProctorView
        onViolation={handleViolation}
        onTrustScoreUpdate={handleTrustScoreUpdate}
        showDebugInfo={showDebugInfo}
      />

      {/* Violations summary */}
      {violations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('violationsSummary')}
          </h3>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* High severity violations */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1.5" />
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                    {t('highSeverity')}
                  </h4>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {violations.filter(v => v.severity === 'high').length}
                </div>
              </div>

              {/* Medium severity violations */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    {t('mediumSeverity')}
                  </h4>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {violations.filter(v => v.severity === 'medium').length}
                </div>
              </div>

              {/* Low severity violations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mr-1.5" />
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    {t('lowSeverity')}
                  </h4>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {violations.filter(v => v.severity === 'low').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
