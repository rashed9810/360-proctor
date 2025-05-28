import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

/**
 * Calendar view component for exams
 * @param {Object} props - Component props
 * @param {Array} props.exams - List of exams to display
 * @param {Function} props.onExamClick - Function to handle exam click
 * @param {Function} props.onDateClick - Function to handle date click
 */
const ExamCalendar = ({ exams = [], onExamClick, onDateClick }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [examsOnSelectedDate, setExamsOnSelectedDate] = useState([]);

  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the last day of the previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        hasExams: examsOnDate(date).length > 0,
        exams: examsOnDate(date),
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        hasExams: examsOnDate(date).length > 0,
        exams: examsOnDate(date),
      });
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        hasExams: examsOnDate(date).length > 0,
        exams: examsOnDate(date),
      });
    }

    setCalendarDays(days);

    // If no date is selected, select today or the first day with exams
    if (!selectedDate) {
      const today = days.find(day => day.isToday);
      const firstDayWithExams = days.find(day => day.hasExams && day.isCurrentMonth);
      setSelectedDate(
        today?.date || firstDayWithExams?.date || days.find(day => day.isCurrentMonth)?.date
      );
    }
  }, [currentDate, exams, selectedDate]);

  // Update exams on selected date when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setExamsOnSelectedDate(examsOnDate(selectedDate));
    }
  }, [selectedDate, exams]);

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Get exams on a specific date
  const examsOnDate = date => {
    return exams.filter(exam => {
      const examDate = new Date(exam.date);
      return isSameDay(examDate, date);
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    const today = new Date();
    setSelectedDate(today);
  };

  // Handle date click
  const handleDateClick = date => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  // Handle exam click
  const handleExamClick = exam => {
    if (onExamClick) {
      onExamClick(exam);
    }
  };

  // Format date for display
  const formatDate = date => {
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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2" />
          {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            {t('previous')}
          </button>
          <button
            onClick={goToToday}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('today')}
          </button>
          <button
            onClick={goToNextMonth}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('next')}
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 md:divide-x md:divide-y-0 divide-y divide-gray-200 dark:divide-gray-700">
        {/* Calendar grid */}
        <div className="md:col-span-5">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {t(day.toLowerCase())}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] p-2 bg-white dark:bg-gray-800 ${
                  !day.isCurrentMonth
                    ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
                    : ''
                } ${
                  isSameDay(day.date, selectedDate)
                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 z-10'
                    : ''
                }`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-right ${
                      day.isToday
                        ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
                        : ''
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                    {day.exams.slice(0, 3).map((exam, examIndex) => (
                      <div
                        key={examIndex}
                        className={`px-2 py-1 text-xs rounded truncate cursor-pointer ${
                          getExamStatus(exam).color
                        }`}
                        onClick={e => {
                          e.stopPropagation();
                          handleExamClick(exam);
                        }}
                      >
                        {exam.time.substring(0, 5)} {exam.title}
                      </div>
                    ))}
                    {day.exams.length > 3 && (
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        +{day.exams.length - 3} {t('more')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day details */}
        <div className="md:col-span-2 p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {selectedDate ? formatDate(selectedDate) : t('selectDate')}
          </h3>

          {examsOnSelectedDate.length === 0 ? (
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">{t('noExamsScheduled')}</p>
          ) : (
            <div className="mt-4 space-y-4">
              {examsOnSelectedDate.map((exam, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{exam.title}</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {exam.time} ({exam.duration} {t('minutes')})
                    </div>
                    {exam.subject && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        {exam.subject}
                      </div>
                    )}
                    {exam.students && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {exam.students} {t('students')}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link
                      to={`/exams/${exam.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('viewDetails')}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCalendar;
