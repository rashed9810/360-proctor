import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Quick Action Panel component for frequently used actions
 */
const QuickActionPanel = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Define quick actions
  const actions = [
    {
      id: 'create-exam',
      name: t('quickActions.createExam', { defaultValue: 'Create Exam' }),
      icon: DocumentPlusIcon,
      to: '/exams/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'add-student',
      name: t('quickActions.addStudent', { defaultValue: 'Add Student' }),
      icon: UserPlusIcon,
      to: '/students/add',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'export-data',
      name: t('quickActions.exportData', { defaultValue: 'Export Data' }),
      icon: ArrowDownTrayIcon,
      to: '/export',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label={
          isOpen
            ? t('quickActions.close', { defaultValue: 'Close Quick Actions' })
            : t('quickActions.open', { defaultValue: 'Open Quick Actions' })
        }
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
      </motion.button>

      {/* Actions panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t('quickActions.title', { defaultValue: 'Quick Actions' })}
            </h3>
            <div className="space-y-2">
              {actions.map(action => (
                <motion.div key={action.id} whileHover={{ x: 5 }} className="block">
                  <Link
                    to={action.to}
                    className={`flex items-center p-2 rounded-md ${action.color} text-white transition-colors duration-150`}
                  >
                    <action.icon className="h-5 w-5 mr-2" />
                    <span>{action.name}</span>
                    <ChevronDoubleRightIcon className="h-4 w-4 ml-auto" />
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                {t('quickActions.close', { defaultValue: 'Close Quick Actions' })}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActionPanel;
