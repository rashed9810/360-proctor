import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

/**
 * Keyboard shortcuts component
 * @param {Object} props - Component props
 * @param {boolean} props.enabled - Whether keyboard shortcuts are enabled
 */
const KeyboardShortcuts = ({ enabled = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: '?',
      description: t('shortcuts.showShortcuts'),
      action: () => setShowModal(true),
      category: 'general',
    },
    {
      key: 'g d',
      description: t('shortcuts.goToDashboard'),
      action: () => navigate('/'),
      category: 'navigation',
    },
    {
      key: 'g e',
      description: t('shortcuts.goToExams'),
      action: () => navigate('/exams'),
      category: 'navigation',
    },
    {
      key: 'g s',
      description: t('shortcuts.goToStudents'),
      action: () => navigate('/students'),
      category: 'navigation',
    },
    {
      key: 'g a',
      description: t('shortcuts.goToAnalytics'),
      action: () => navigate('/analytics'),
      category: 'navigation',
    },
    {
      key: 'g n',
      description: t('shortcuts.goToNotifications'),
      action: () => navigate('/notifications'),
      category: 'navigation',
    },
    {
      key: 'g p',
      description: t('shortcuts.goToProfile'),
      action: () => navigate('/profile'),
      category: 'navigation',
    },
    {
      key: 'n e',
      description: t('shortcuts.newExam'),
      action: () => navigate('/exams/create'),
      category: 'actions',
    },
    {
      key: 'n s',
      description: t('shortcuts.newStudent'),
      action: () => navigate('/students/add'),
      category: 'actions',
    },
    {
      key: 't',
      description: t('shortcuts.toggleTheme'),
      action: () => document.querySelector('#theme-toggle')?.click(),
      category: 'appearance',
    },
    {
      key: 'Ctrl+k',
      description: t('shortcuts.search'),
      action: () => setShowSearch(true),
      category: 'general',
    },
    {
      key: 'Esc',
      description: t('shortcuts.closeModal'),
      action: () => {
        setShowModal(false);
        setShowSearch(false);
      },
      category: 'general',
    },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    let keys = [];
    let keyTimeout;

    const handleKeyDown = e => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Handle special keys
      if (e.key === 'Escape') {
        const escShortcut = shortcuts.find(s => s.key === 'Esc');
        if (escShortcut) escShortcut.action();
        return;
      }

      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchShortcut = shortcuts.find(s => s.key === 'Ctrl+k');
        if (searchShortcut) searchShortcut.action();
        return;
      }

      // Handle regular keys
      clearTimeout(keyTimeout);

      // Add key to sequence
      keys.push(e.key.toLowerCase());

      // Check if the sequence matches any shortcut
      const keySequence = keys.join(' ');
      const matchingShortcut = shortcuts.find(
        s => s.key.toLowerCase() === keySequence || s.key === e.key
      );

      if (matchingShortcut) {
        matchingShortcut.action();
        keys = [];
      } else {
        // Reset keys after a delay if no match is found
        keyTimeout = setTimeout(() => {
          keys = [];
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimeout);
    };
  }, [enabled, shortcuts, navigate]);

  // Render keyboard shortcut modal
  const renderShortcutModal = () => {
    return (
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setShowModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 w-full max-w-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <CommandLineIcon className="h-5 w-5 mr-2" />
                    {t('shortcuts.title')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        {t(`shortcuts.categories.${category}`)}
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {shortcuts.map((shortcut, index) => (
                              <tr key={index}>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {shortcut.key.split(' ').map((k, i) => (
                                    <span key={i}>
                                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                        {k}
                                      </kbd>
                                      {i < shortcut.key.split(' ').length - 1 && (
                                        <span className="mx-1 text-gray-500 dark:text-gray-400">
                                          then
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {shortcut.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
                  {t('shortcuts.tip')}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // Render search modal
  const renderSearchModal = () => {
    return (
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-start justify-center min-h-screen pt-16 p-4">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setShowSearch(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 w-full max-w-lg overflow-hidden"
              >
                <div className="p-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t('search')}
                      className="block w-full pl-4 pr-10 py-3 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-0 bg-transparent text-lg focus:outline-none"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {/* Search results would go here */}
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {t('searchResults')}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // Render help button
  const renderHelpButton = () => {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
          aria-label={t('shortcuts.showShortcuts')}
        >
          <span className="text-lg font-medium">?</span>
        </button>
      </div>
    );
  };

  if (!enabled) return null;

  return (
    <>
      {renderShortcutModal()}
      {renderSearchModal()}
      {renderHelpButton()}
    </>
  );
};

export default KeyboardShortcuts;
