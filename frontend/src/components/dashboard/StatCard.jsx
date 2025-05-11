import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced StatCard component with consistent styling and animations
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Card value
 * @param {React.Component} props.icon - Icon component
 * @param {number} props.trend - Trend percentage (positive or negative)
 * @param {string} props.color - Color theme ('primary', 'blue', 'green', 'purple', 'red', 'yellow')
 * @param {string} props.linkTo - Link destination for "View all" button
 * @param {string} props.linkText - Text for the link button
 */
const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', linkTo, linkText }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colorClasses = {
    primary: {
      bg: isDark ? 'bg-primary-900/20' : 'bg-primary-50',
      text: isDark ? 'text-primary-300' : 'text-primary-600',
      border: isDark ? 'border-primary-800' : 'border-primary-100',
      icon: isDark ? 'text-primary-400' : 'text-primary-500',
      value: isDark ? 'text-primary-200' : 'text-primary-900',
      button: isDark
        ? 'bg-primary-800 text-primary-200 hover:bg-primary-700'
        : 'bg-primary-50 text-primary-700 hover:bg-primary-100',
    },
    blue: {
      bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      text: isDark ? 'text-blue-300' : 'text-blue-600',
      border: isDark ? 'border-blue-800' : 'border-blue-100',
      icon: isDark ? 'text-blue-400' : 'text-blue-500',
      value: isDark ? 'text-blue-200' : 'text-blue-900',
      button: isDark
        ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
        : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    green: {
      bg: isDark ? 'bg-green-900/20' : 'bg-green-50',
      text: isDark ? 'text-green-300' : 'text-green-600',
      border: isDark ? 'border-green-800' : 'border-green-100',
      icon: isDark ? 'text-green-400' : 'text-green-500',
      value: isDark ? 'text-green-200' : 'text-green-900',
      button: isDark
        ? 'bg-green-800 text-green-200 hover:bg-green-700'
        : 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    purple: {
      bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      text: isDark ? 'text-purple-300' : 'text-purple-600',
      border: isDark ? 'border-purple-800' : 'border-purple-100',
      icon: isDark ? 'text-purple-400' : 'text-purple-500',
      value: isDark ? 'text-purple-200' : 'text-purple-900',
      button: isDark
        ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
        : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
    red: {
      bg: isDark ? 'bg-red-900/20' : 'bg-red-50',
      text: isDark ? 'text-red-300' : 'text-red-600',
      border: isDark ? 'border-red-800' : 'border-red-100',
      icon: isDark ? 'text-red-400' : 'text-red-500',
      value: isDark ? 'text-red-200' : 'text-red-900',
      button: isDark
        ? 'bg-red-800 text-red-200 hover:bg-red-700'
        : 'bg-red-50 text-red-700 hover:bg-red-100',
    },
    yellow: {
      bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      text: isDark ? 'text-yellow-300' : 'text-yellow-600',
      border: isDark ? 'border-yellow-800' : 'border-yellow-100',
      icon: isDark ? 'text-yellow-400' : 'text-yellow-500',
      value: isDark ? 'text-yellow-200' : 'text-yellow-900',
      button: isDark
        ? 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700'
        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border ${classes.border} ${classes.bg} p-6 shadow-sm dark:shadow-gray-900/10 overflow-hidden relative`}
    >
      {/* Background pattern for visual interest */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br from-current to-transparent" />

      <div className="flex items-center justify-between relative">
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
          className={`p-3 rounded-lg ${classes.bg} shadow-sm`}
        >
          <Icon className={`h-6 w-6 ${classes.icon}`} />
        </motion.div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center group relative">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trend > 0
                ? isDark
                  ? 'bg-green-900/30 text-green-300'
                  : 'bg-green-100 text-green-800'
                : isDark
                  ? 'bg-red-900/30 text-red-300'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {t('fromLastMonth')}
          </span>

          {/* Tooltip for percentage change */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block pointer-events-none z-10">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
              {trend > 0 ? t('percentIncrease') : t('percentDecrease')} {t('fromLastMonth')}
            </div>
          </div>
        </div>
      )}

      {/* Link button with consistent styling */}
      {linkTo && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={linkTo}
            className={`inline-flex items-center text-sm font-medium ${classes.text} hover:underline transition-all duration-300 ease-in-out transform hover:translate-x-1 group`}
          >
            {linkText || t('viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
