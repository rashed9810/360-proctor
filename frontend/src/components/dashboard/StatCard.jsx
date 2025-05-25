import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/Loading';
import { cn } from '../../utils/cn';

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
 * @param {Function} props.fetchData - Function to fetch updated data
 * @param {string} props.detailsPath - Path to detailed view
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.dataKey - Key identifier for this stat
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  linkTo,
  linkText,
  fetchData,
  detailsPath,
  isLoading: externalLoading,
  dataKey,
  animate = true,
  showSparkles = false,
  gradient = false,
  className,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(externalLoading || false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

  // Function to refresh data
  const handleRefresh = async () => {
    if (fetchData && typeof fetchData === 'function') {
      setIsLoading(true);
      try {
        await fetchData(dataKey);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!fetchData) return;

    const intervalId = setInterval(
      () => {
        handleRefresh();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Modern color system with gradients
  const getColorClasses = colorName => {
    const colors = {
      primary: {
        gradient: 'from-blue-500 to-purple-600',
        bg: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500 dark:text-blue-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-blue-500',
        border: 'border-blue-200 dark:border-blue-800',
      },
      blue: {
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500 dark:text-blue-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-blue-500',
        border: 'border-blue-200 dark:border-blue-800',
      },
      green: {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-500 dark:text-green-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-green-500',
        border: 'border-green-200 dark:border-green-800',
      },
      purple: {
        gradient: 'from-purple-500 to-pink-500',
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-500 dark:text-purple-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-purple-500',
        border: 'border-purple-200 dark:border-purple-800',
      },
      red: {
        gradient: 'from-red-500 to-pink-500',
        bg: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-500 dark:text-red-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-red-500',
        border: 'border-red-200 dark:border-red-800',
      },
      yellow: {
        gradient: 'from-yellow-500 to-orange-500',
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: 'text-yellow-500 dark:text-yellow-400',
        value: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-yellow-500',
        border: 'border-yellow-200 dark:border-yellow-800',
      },
    };
    return colors[colorName] || colors.primary;
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      whileHover={animate ? { y: -4 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300',
        gradient ? `bg-gradient-to-br ${colorClasses.gradient}` : colorClasses.bg,
        colorClasses.border,
        'hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/20',
        'hover:border-opacity-50',
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div
          className={cn(
            'absolute -right-8 -top-8 h-32 w-32 rounded-full transition-all duration-500',
            `bg-gradient-to-br ${colorClasses.gradient}`,
            isHovered ? 'scale-110 opacity-20' : 'scale-100 opacity-10'
          )}
        />
        <div
          className={cn(
            'absolute -left-4 -bottom-4 h-20 w-20 rounded-full transition-all duration-700',
            `bg-gradient-to-tr ${colorClasses.gradient}`,
            isHovered ? 'scale-125 opacity-15' : 'scale-100 opacity-5'
          )}
        />
      </div>

      {/* Sparkles effect */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <SparklesIcon className="h-3 w-3 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {fetchData && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-xl backdrop-blur-sm transition-all duration-200',
              'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30',
              colorClasses.text,
              isLoading && 'animate-pulse'
            )}
            title={t('refreshData')}
          >
            <ArrowPathIcon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </motion.button>
        )}
        {detailsPath && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              'p-2 rounded-xl backdrop-blur-sm transition-all duration-200',
              'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30',
              colorClasses.text
            )}
            title={t('viewDetails')}
          >
            <ChartBarIcon className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Main content */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-2', colorClasses.text)}>{title}</p>
          <motion.div
            initial={animate ? { scale: 0.8, opacity: 0 } : {}}
            animate={animate ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="flex items-baseline space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="md" color={color} />
            ) : (
              <span className={cn('text-3xl font-bold', colorClasses.value)}>{value}</span>
            )}
          </motion.div>

          {/* Trend indicator */}
          {trend && !isLoading && (
            <motion.div
              initial={animate ? { opacity: 0, x: -10 } : {}}
              animate={animate ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center mt-3 space-x-1"
            >
              <div
                className={cn(
                  'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  trend > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend > 0 ? (
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(trend)}%
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('fromLastMonth')}</span>
            </motion.div>
          )}

          {/* Last updated */}
          {lastUpdated && fetchData && !isLoading && (
            <p className="text-xs text-gray-400 mt-2">
              {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Icon */}
        <motion.div
          initial={animate ? { scale: 0, rotate: -180 } : {}}
          animate={animate ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex-shrink-0 p-3 rounded-2xl transition-all duration-300',
            gradient
              ? 'bg-white/20 dark:bg-black/20'
              : `bg-gradient-to-br ${colorClasses.gradient}`,
            'group-hover:scale-110 group-hover:rotate-3'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6 transition-colors duration-300',
              gradient ? 'text-white' : 'text-white'
            )}
          />
        </motion.div>
      </div>

        {/* Link button */}
        {linkTo && (
          <motion.div
            initial={animate ? { opacity: 0, y: 10 } : {}}
            animate={animate ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <Link
              to={linkTo}
              className={cn(
                'inline-flex items-center text-sm font-medium transition-all duration-300',
                'hover:translate-x-1 group',
                colorClasses.text,
                'hover:underline'
              )}
            >
              {linkText || t('viewAll')}
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Detailed view modal */}
      {showDetails && detailsPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title} {t('details')}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="sr-only">{t('close')}</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <iframe
                src={detailsPath}
                className="w-full h-full border-0 rounded-xl"
                title={`${title} ${t('details')}`}
              />
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatCard;
