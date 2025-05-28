import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import ExamCalendar from '../components/calendar/ExamCalendar';
import mockExamService from '../services/mockExams';

/**
 * Calendar view page component
 */
const CalendarView = () => {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamDetails, setShowExamDetails] = useState(false);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const data = await mockExamService.getExams();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Handle exam click
  const handleExamClick = exam => {
    setSelectedExam(exam);
    setShowExamDetails(true);
  };

  // Handle date click
  const handleDateClick = date => {
    console.log('Date clicked:', date);
  };

  // Format date for display
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get exam status and color
  const getExamStatus = exam => {
    const examDate = new Date(exam.date + ' ' + exam.time);
    const now = new Date();
    const timeUntil = examDate - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 0) {
      return {
        status: t('completed'),
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      };
    }
    if (hoursUntil < 2) {
      return {
        status: t('imminent'),
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      };
    }
    if (hoursUntil < 24) {
      return {
        status: t('today'),
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      };
    }
    return {
      status: t('upcoming'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <CalendarIcon className="h-7 w-7 mr-2" />
          {t('examCalendar')}
        </h1>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 flex justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <ExamCalendar exams={exams} onExamClick={handleExamClick} onDateClick={handleDateClick} />
      )}

      {/* Exam details modal */}
      {showExamDetails && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedExam.title}
              </h3>
              <button
                onClick={() => setShowExamDetails(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">{t('close')}</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('date')}
                  </h4>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {formatDate(selectedExam.date)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('time')}
                  </h4>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedExam.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('duration')}
                  </h4>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {selectedExam.duration} {t('minutes')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('status')}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getExamStatus(selectedExam).color
                    }`}
                  >
                    {getExamStatus(selectedExam).status}
                  </span>
                </div>
                {selectedExam.subject && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('subject')}
                    </h4>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      {selectedExam.subject}
                    </p>
                  </div>
                )}
                {selectedExam.description && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('description')}
                    </h4>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      {selectedExam.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
              <button
                onClick={() => setShowExamDetails(false)}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                {t('close')}
              </button>
              <a
                href={`/exams/${selectedExam.id}`}
                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('viewDetails')}
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
