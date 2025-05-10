import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const { t } = useTranslation();

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-100',
      icon: 'text-primary-500',
      value: 'text-primary-900',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-100',
      icon: 'text-green-500',
      value: 'text-green-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-100',
      icon: 'text-yellow-500',
      value: 'text-yellow-900',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      icon: 'text-red-500',
      value: 'text-red-900',
    },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border ${classes.border} ${classes.bg} p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${classes.text}`}>{title}</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`mt-2 text-3xl font-bold ${classes.value}`}
          >
            {value}
          </motion.p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-3 rounded-lg ${classes.bg}`}
        >
          <Icon className={`h-6 w-6 ${classes.icon}`} />
        </motion.div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">
            {t('fromLastMonth')}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
