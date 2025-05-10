import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { bn } from 'date-fns/locale/bn';

const ExamCalendar = ({ exams = [] }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getExamsForDate = date => {
    return exams.filter(exam => {
      // Handle different date formats
      const examDate = exam.startTime
        ? new Date(exam.startTime)
        : exam.date
          ? new Date(exam.date)
          : null;
      return examDate && isSameDay(examDate, date);
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const getDayClass = day => {
    const baseClasses = 'h-24 p-2 border border-gray-200 relative';
    const todayClasses = isToday(day) ? 'bg-blue-50' : '';
    const selectedClasses = isSameDay(day, selectedDate) ? 'ring-2 ring-primary-500' : '';
    const otherMonthClasses = !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : '';

    return `${baseClasses} ${todayClasses} ${selectedClasses} ${otherMonthClasses}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {format(currentDate, 'MMMM yyyy', { locale: bn })}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {days.map(day => {
          const dayExams = getExamsForDate(day);
          return (
            <motion.div
              key={day.toString()}
              whileHover={{ scale: 1.02 }}
              className={getDayClass(day)}
              onClick={() => setSelectedDate(day)}
            >
              <span className="text-sm font-medium">{format(day, 'd')}</span>

              <AnimatePresence>
                {dayExams.map(exam => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 p-1 bg-primary-50 rounded text-xs text-primary-700 truncate"
                  >
                    {exam.title}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: bn })}
            </h3>

            <div className="space-y-4">
              {getExamsForDate(selectedDate).map(exam => (
                <motion.div
                  key={exam.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{exam.title}</h4>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {exam.startTime
                            ? format(new Date(exam.startTime), 'h:mm a')
                            : '00:00 AM'}{' '}
                          - {exam.endTime ? format(new Date(exam.endTime), 'h:mm a') : '00:00 AM'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {exam.participants || 0} {t('participants')}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      {t('viewDetails')}
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {getExamsForDate(selectedDate).length === 0 && (
                <p className="text-center text-gray-500 py-4">{t('noExamsScheduled')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExamCalendar;
