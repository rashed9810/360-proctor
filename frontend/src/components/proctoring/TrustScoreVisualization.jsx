import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

/**
 * Trust Score Visualization Component
 * Displays real-time trust scores with visual indicators and trends
 */
export default function TrustScoreVisualization({ students = [], examId, className = '' }) {
  const { t } = useTranslation(['proctoring', 'common']);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreHistory, setScoreHistory] = useState({});

  // Calculate overall statistics
  const totalStudents = students.length;
  const averageScore =
    students.length > 0
      ? students.reduce((sum, student) => sum + (student.trustScore || 0), 0) / students.length
      : 0;

  const highTrustStudents = students.filter(s => (s.trustScore || 0) >= 0.8).length;
  const mediumTrustStudents = students.filter(
    s => (s.trustScore || 0) >= 0.6 && (s.trustScore || 0) < 0.8
  ).length;
  const lowTrustStudents = students.filter(s => (s.trustScore || 0) < 0.6).length;

  /**
   * Get trust score color based on value
   */
  const getTrustScoreColor = score => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  /**
   * Get trust score icon based on value
   */
  const getTrustScoreIcon = score => {
    if (score >= 0.8) return ShieldCheckIcon;
    if (score >= 0.6) return ExclamationTriangleIcon;
    return XCircleIcon;
  };

  /**
   * Get trust score label
   */
  const getTrustScoreLabel = score => {
    if (score >= 0.8) return t('trustScoreSettings.high');
    if (score >= 0.6) return t('trustScoreSettings.medium');
    return t('trustScoreSettings.low');
  };

  /**
   * Format trust score as percentage
   */
  const formatTrustScore = score => {
    return `${Math.round((score || 0) * 100)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('trustScore')} {t('common.analytics')}
            </h3>
          </div>
          <div className="text-sm text-gray-500">
            {t('common.total')}: {totalStudents} {t('common.students')}
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Average Score */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatTrustScore(averageScore)}</div>
            <div className="text-sm text-gray-500">{t('trustScoreSettings.average')}</div>
          </div>

          {/* High Trust */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{highTrustStudents}</div>
            <div className="text-sm text-gray-500">{t('trustScoreSettings.high')}</div>
          </div>

          {/* Medium Trust */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumTrustStudents}</div>
            <div className="text-sm text-gray-500">{t('trustScoreSettings.medium')}</div>
          </div>

          {/* Low Trust */}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{lowTrustStudents}</div>
            <div className="text-sm text-gray-500">{t('trustScoreSettings.low')}</div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t('common.noStudents')}</div>
          ) : (
            students.map(student => {
              const score = student.trustScore || 0;
              const ScoreIcon = getTrustScoreIcon(score);
              const colorClass = getTrustScoreColor(score);

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  {/* Student Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={student.avatar || '/assets/images/default-avatar.svg'}
                      alt={student.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatTrustScore(score)}</div>
                      <div className="text-xs text-gray-500">{getTrustScoreLabel(score)}</div>
                    </div>
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <ScoreIcon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Trust Score Distribution Chart */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('trustScoreSettings.distribution')}
        </h4>
        <div className="space-y-2">
          {/* High Trust Bar */}
          <div className="flex items-center">
            <div className="w-16 text-xs text-gray-500">{t('trustScoreSettings.high')}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalStudents > 0 ? `${(highTrustStudents / totalStudents) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">{highTrustStudents}</div>
          </div>

          {/* Medium Trust Bar */}
          <div className="flex items-center">
            <div className="w-16 text-xs text-gray-500">{t('trustScoreSettings.medium')}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    totalStudents > 0 ? `${(mediumTrustStudents / totalStudents) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">{mediumTrustStudents}</div>
          </div>

          {/* Low Trust Bar */}
          <div className="flex items-center">
            <div className="w-16 text-xs text-gray-500">{t('trustScoreSettings.low')}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalStudents > 0 ? `${(lowTrustStudents / totalStudents) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">{lowTrustStudents}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
