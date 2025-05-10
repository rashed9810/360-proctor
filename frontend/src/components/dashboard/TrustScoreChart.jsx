import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';

const TrustScoreChart = ({ data = [], examId }) => {
  const { t } = useTranslation();
  const [trustScores, setTrustScores] = useState(
    data.map(exam => ({
      timestamp: exam.date || new Date().toLocaleDateString(),
      score: exam.trustScore ? Math.round(exam.trustScore * 100) : 85,
      violations: exam.violations || 0,
    })) || []
  );
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/proctoring');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'trust_score_update') {
        setTrustScores(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            score: data.score,
            violations: data.violations,
          },
        ]);
      }
    }
  }, [lastMessage]);

  // Calculate average trust score
  const averageScore =
    trustScores.length > 0
      ? trustScores.reduce((acc, curr) => acc + curr.score, 0) / trustScores.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{t('trustScoreTrend')}</h3>
          <p className="text-sm text-gray-500">{t('realTimeMonitoring')}</p>
        </div>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-primary-50 rounded-lg px-4 py-2"
        >
          <p className="text-sm text-primary-600">{t('averageScore')}</p>
          <p className="text-2xl font-bold text-primary-700">{averageScore.toFixed(1)}%</p>
        </motion.div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trustScores} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="timestamp" stroke="#6B7280" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={value => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={value => [`${value}%`, t('trustScore')]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4F46E5"
              fillOpacity={1}
              fill="url(#colorScore)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">{t('totalViolations')}</p>
          <p className="text-2xl font-bold text-red-700">
            {trustScores.reduce((acc, curr) => acc + curr.violations, 0)}
          </p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">{t('currentScore')}</p>
          <p className="text-2xl font-bold text-green-700">
            {trustScores.length > 0 ? `${trustScores[trustScores.length - 1].score}%` : '0%'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrustScoreChart;
