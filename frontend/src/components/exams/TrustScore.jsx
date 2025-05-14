import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Trust Score component for visualizing student trust scores
 * @param {Object} props - Component props
 * @param {Object} props.student - Student data
 * @param {Array} props.trustHistory - Trust score history data
 * @param {Array} props.violations - Violations data
 */
const TrustScore = ({ student, trustHistory = [], violations = [] }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  // Calculate current trust score
  const currentScore = student?.trustScore || 0;

  // Determine score color and icon
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 dark:text-green-400';
    if (score >= 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <ShieldCheckIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
    if (score >= 60) return <ShieldExclamationIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
    return <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
  };

  // Calculate trust factors
  const trustFactors = [
    {
      id: 'face_detection',
      name: t('exams.faceDetection'),
      score: student?.faceDetectionScore || 0,
      description: t('exams.faceDetectionDescription'),
    },
    {
      id: 'eye_tracking',
      name: t('exams.eyeTracking'),
      score: student?.eyeTrackingScore || 0,
      description: t('exams.eyeTrackingDescription'),
    },
    {
      id: 'audio_analysis',
      name: t('exams.audioAnalysis'),
      score: student?.audioAnalysisScore || 0,
      description: t('exams.audioAnalysisDescription'),
    },
    {
      id: 'tab_switching',
      name: t('exams.tabSwitching'),
      score: student?.tabSwitchingScore || 0,
      description: t('exams.tabSwitchingDescription'),
    },
    {
      id: 'phone_detection',
      name: t('exams.phoneDetection'),
      score: student?.phoneDetectionScore || 0,
      description: t('exams.phoneDetectionDescription'),
    },
  ];

  // Format trust history data for chart
  const formattedHistory = trustHistory.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: item.score,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('exams.trustScore')}
        </h2>
        <div className="flex items-center">
          {getScoreIcon(currentScore)}
          <span className={`ml-2 text-2xl font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}%
          </span>
        </div>
      </div>

      {/* Trust Score Gauge */}
      <div className="mb-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 dark:text-red-400 dark:bg-red-900/30">
                {t('exams.critical')}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30">
                {t('exams.warning')}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:text-green-400 dark:bg-green-900/30">
                {t('exams.good')}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
            <div
              style={{ width: `${currentScore}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                currentScore >= 80
                  ? 'bg-green-500'
                  : currentScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Trust Score Status */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentScore >= 80 ? (
              <ShieldCheckIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
            ) : currentScore >= 60 ? (
              <ShieldExclamationIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {currentScore >= 80
                ? t('exams.trustScoreGood')
                : currentScore >= 60
                  ? t('exams.trustScoreWarning')
                  : t('exams.trustScoreCritical')}
            </h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>
                {currentScore >= 80
                  ? t('exams.trustScoreGoodDescription')
                  : currentScore >= 60
                    ? t('exams.trustScoreWarningDescription')
                    : t('exams.trustScoreCriticalDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score History */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
        >
          <span>{t('exams.trustScoreHistory')}</span>
          {showDetails ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedHistory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent violations */}
            {violations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('exams.recentViolations')}
                </h4>
                <div className="space-y-2">
                  {violations.slice(0, 3).map((violation) => (
                    <div
                      key={violation.id}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 p-1 rounded-full ${
                            violation.severity === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : violation.severity === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}
                        >
                          <ExclamationTriangleIcon
                            className={`h-4 w-4 ${
                              violation.severity === 'high'
                                ? 'text-red-500 dark:text-red-400'
                                : violation.severity === 'medium'
                                  ? 'text-yellow-500 dark:text-yellow-400'
                                  : 'text-blue-500 dark:text-blue-400'
                            }`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                              {t(`exams.violationTypes.${violation.type}`)}
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(violation.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {violation.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Trust Score Factors */}
      <div>
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
        >
          <span>{t('exams.trustScoreFactors')}</span>
          {showFactors ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {showFactors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {trustFactors.map((factor) => (
              <div key={factor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {factor.name}
                  </h4>
                  <span
                    className={`text-sm font-semibold ${
                      factor.score >= 80
                        ? 'text-green-500 dark:text-green-400'
                        : factor.score >= 60
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {factor.score}%
                  </span>
                </div>
                <div className="overflow-hidden h-1.5 mb-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${factor.score}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      factor.score >= 80
                        ? 'bg-green-500'
                        : factor.score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {factor.description}
                </p>
              </div>
            ))}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {t('exams.howTrustScoreWorks')}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>{t('exams.trustScoreExplanation')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrustScore;
