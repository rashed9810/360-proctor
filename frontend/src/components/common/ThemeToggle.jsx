import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

/**
 * Theme toggle component that switches between light and dark modes
 * @param {Object} props - Component props
 * @param {string} props.size - 'sm', 'md', or 'lg' (default: 'md')
 * @param {string} props.position - 'navbar' or 'settings' (default: 'navbar')
 */
const ThemeToggle = ({ size = 'md', position = 'navbar' }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Size variants
  const sizes = {
    sm: {
      toggle: 'w-10 h-5',
      slider: 'w-4 h-4',
      translate: 'translate-x-5',
      icon: 'h-3 w-3',
    },
    md: {
      toggle: 'w-12 h-6',
      slider: 'w-5 h-5',
      translate: 'translate-x-6',
      icon: 'h-4 w-4',
    },
    lg: {
      toggle: 'w-14 h-7',
      slider: 'w-6 h-6',
      translate: 'translate-x-7',
      icon: 'h-5 w-5',
    },
  };

  // Position styles
  const positions = {
    navbar: 'mr-1',
    settings: '',
  };

  const currentSize = sizes[size];
  const positionClass = positions[position];

  return (
    <div className={`flex items-center ${positionClass} group relative`}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`relative inline-flex items-center ${currentSize.toggle} rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
          isDark ? 'bg-primary-600' : 'bg-gray-200'
        }`}
        aria-label={t('settings.theme')}
      >
        <span className="sr-only">{isDark ? t('settings.lightMode') : t('settings.darkMode')}</span>

        {/* Sun icon (visible in light mode) */}
        <span
          className={`absolute inset-0 flex items-center justify-start pl-1 transition-opacity duration-200 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <SunIcon className={`${currentSize.icon} text-yellow-500`} aria-hidden="true" />
        </span>

        {/* Moon icon (visible in dark mode) */}
        <span
          className={`absolute inset-0 flex items-center justify-end pr-1 transition-opacity duration-200 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <MoonIcon className={`${currentSize.icon} text-indigo-200`} aria-hidden="true" />
        </span>

        {/* Toggle slider with animation */}
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30,
            duration: 0.3,
          }}
          className={`${currentSize.slider} bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
            isDark ? currentSize.translate : ''
          }`}
        />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-8 hidden group-hover:block pointer-events-none"
        >
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {isDark ? t('settings.switchToLightMode') : t('settings.switchToDarkMode')}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
