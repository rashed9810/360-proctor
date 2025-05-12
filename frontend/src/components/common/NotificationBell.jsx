import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { BellIcon, BellAlertIcon, CheckIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';

/**
 * Notification bell component with dropdown
 * @param {Object} props - Component props
 * @param {string} props.size - 'sm', 'md', or 'lg' (default: 'md')
 * @param {string} props.position - 'navbar' or 'settings' (default: 'navbar')
 */
const NotificationBell = ({ size = 'md', position = 'navbar' }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Size variants
  const sizes = {
    sm: {
      bell: 'h-5 w-5',
      badge: 'h-4 w-4 text-xs',
      dropdown: 'w-72',
    },
    md: {
      bell: 'h-6 w-6',
      badge: 'h-5 w-5 text-xs',
      dropdown: 'w-80',
    },
    lg: {
      bell: 'h-7 w-7',
      badge: 'h-6 w-6 text-sm',
      dropdown: 'w-96',
    },
  };

  // Position styles
  const positions = {
    navbar: 'mr-1',
    settings: '',
  };

  const currentSize = sizes[size];
  const positionClass = positions[position];

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${positionClass} group`}>
      <motion.button
        ref={bellRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimating ? { rotate: [0, 15, -15, 10, -10, 5, -5, 0] } : {}}
        transition={isAnimating ? { duration: 0.5 } : {}}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        aria-label={t('notifications:notifications.title')}
      >
        <span className="sr-only">{t('notifications:notifications.title')}</span>
        {unreadCount > 0 ? (
          <BellAlertIcon className={`${currentSize.bell}`} aria-hidden="true" />
        ) : (
          <BellIcon className={`${currentSize.bell}`} aria-hidden="true" />
        )}

        {/* Notification badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-1 -right-1 ${currentSize.badge} flex items-center justify-center rounded-full bg-red-500 text-white font-semibold ring-2 ring-white dark:ring-gray-800`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-8 hidden group-hover:block pointer-events-none"
          >
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {t('notifications:notifications.viewNotifications')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown
            ref={dropdownRef}
            onClose={() => setIsOpen(false)}
            onMarkAllAsRead={markAllAsRead}
            size={currentSize.dropdown}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
