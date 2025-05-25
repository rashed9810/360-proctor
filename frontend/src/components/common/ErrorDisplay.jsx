import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * A visually appealing error display component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {string} props.backLink - URL to navigate back to
 * @param {string} props.backText - Text for the back button
 * @param {Function} props.onRetry - Function to retry the operation
 * @param {boolean} props.showRetry - Whether to show the retry button
 * @param {React.ReactNode} props.icon - Custom icon to display
 * @param {string} props.variant - Error variant (error, warning, info)
 */
const ErrorDisplay = ({
  title,
  message,
  backLink,
  backText,
  onRetry,
  showRetry = true,
  icon,
  variant = 'error',
}) => {
  const { t } = useTranslation();

  // Determine colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'bg-amber-900/10 dark:bg-amber-900/20',
          border: 'border-amber-800/20 dark:border-amber-700/30',
          text: 'text-amber-800 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600',
          buttonText: 'text-white',
        };
      case 'info':
        return {
          bg: 'bg-blue-900/10 dark:bg-blue-900/20',
          border: 'border-blue-800/20 dark:border-blue-700/30',
          text: 'text-blue-800 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
          buttonText: 'text-white',
        };
      default: // error
        return {
          bg: 'bg-red-900/10 dark:bg-red-900/20',
          border: 'border-red-800/20 dark:border-red-700/30',
          text: 'text-red-800 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
          buttonText: 'text-white',
        };
    }
  };

  const colors = getColors();

  // Default icon based on variant
  const defaultIcon = () => {
    return <ExclamationTriangleIcon className={`h-8 w-8 ${colors.iconColor}`} />;
  };

  // Helper function to handle translation keys or direct strings
  const handleTranslation = text => {
    if (!text) return '';

    // If it looks like a translation key (contains dots and no spaces)
    if (text.includes('.') && !text.includes(' ')) {
      try {
        const translated = t(text);
        // If the translation returns the same key, it means it wasn't found
        if (translated === text) {
          console.warn(`Translation key not found: ${text}`);
          // Extract the last part after the dot as a fallback
          const parts = text.split('.');
          return parts[parts.length - 1].replace(/([A-Z])/g, ' $1').trim();
        }
        return translated;
      } catch (error) {
        console.error(`Error translating: ${text}`, error);
        return text;
      }
    }

    // If it's already a direct string
    return text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-lg shadow-md ${colors.bg} border ${colors.border}`}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${colors.iconBg} mr-4 flex-shrink-0`}>
          {icon || defaultIcon()}
        </div>

        <div className="flex-1">
          <h2 className={`text-lg font-semibold ${colors.text} mb-2`}>
            {handleTranslation(title) || t('common.errorOccurred')}
          </h2>

          <p className={`${colors.text} opacity-90 mb-4`}>{handleTranslation(message)}</p>

          <div className="flex flex-wrap gap-3">
            {backLink && (
              <Link
                to={backLink}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${colors.buttonBg} ${colors.buttonText}`}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {handleTranslation(backText) || t('common.goBack')}
              </Link>
            )}

            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${colors.buttonBg} ${colors.buttonText}`}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {t('common.retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
