import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
  isValid,
} from 'date-fns';

/**
 * Exam scheduling component
 * @param {Object} props - Component props
 * @param {Array} props.schedules - List of existing schedules
 * @param {Function} props.onScheduleAdd - Function to handle adding a schedule
 * @param {Function} props.onScheduleRemove - Function to handle removing a schedule
 * @param {Function} props.onScheduleUpdate - Function to handle updating a schedule
 */
const ExamScheduling = ({ schedules = [], onScheduleAdd, onScheduleRemove, onScheduleUpdate }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: 30,
  });
  const [errors, setErrors] = useState({});

  // Generate calendar days
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Get schedules for a specific date
  const getSchedulesForDate = date => {
    return schedules.filter(schedule => {
      const scheduleDate = parseISO(schedule.date);
      return isValid(scheduleDate) && isSameDay(scheduleDate, date);
    });
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle date selection
  const handleDateSelect = date => {
    setSelectedDate(date);
    setNewSchedule({
      ...newSchedule,
      date: format(date, 'yyyy-MM-dd'),
    });
    setShowScheduleForm(true);
  };

  // Handle form input changes
  const handleChange = e => {
    const { name, value, type } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newSchedule.date) {
      newErrors.date = t('translation:validation.required');
    }

    if (!newSchedule.startTime) {
      newErrors.startTime = t('translation:validation.required');
    }

    if (!newSchedule.endTime) {
      newErrors.endTime = t('translation:validation.required');
    }

    if (newSchedule.startTime && newSchedule.endTime) {
      const start = new Date(`${newSchedule.date}T${newSchedule.startTime}`);
      const end = new Date(`${newSchedule.date}T${newSchedule.endTime}`);

      if (start >= end) {
        newErrors.endTime = t('exams:validation.endTimeAfterStart');
      }
    }

    if (!newSchedule.maxParticipants) {
      newErrors.maxParticipants = t('translation:validation.required');
    } else if (newSchedule.maxParticipants < 1) {
      newErrors.maxParticipants = t('exams:validation.minParticipants');
    } else if (newSchedule.maxParticipants > 500) {
      newErrors.maxParticipants = t('exams:validation.maxParticipants');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onScheduleAdd(newSchedule);
    setNewSchedule({
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      startTime: '',
      endTime: '',
      maxParticipants: 30,
    });
    setShowScheduleForm(false);
  };

  // Handle schedule removal
  const handleRemoveSchedule = scheduleId => {
    onScheduleRemove(scheduleId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('exams:scheduling')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {t(`translation:days.${day.toLowerCase()}`)}
              </div>
            ))}

            {/* Calendar days */}
            {days.map(day => {
              const daySchedules = getSchedulesForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasSchedules = daySchedules.length > 0;

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    relative h-14 p-1 border rounded-md flex flex-col items-center justify-center
                    ${!isSameMonth(day, currentDate) ? 'text-gray-400 dark:text-gray-600' : ''}
                    ${isToday(day) ? 'border-primary-500 dark:border-primary-400' : 'border-gray-200 dark:border-gray-700'}
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                  `}
                >
                  <span
                    className={`text-sm ${isToday(day) ? 'font-bold text-primary-600 dark:text-primary-400' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>

                  {hasSchedules && (
                    <div className="absolute bottom-1 flex space-x-0.5">
                      {daySchedules.slice(0, 3).map((_, index) => (
                        <div
                          key={index}
                          className="h-1 w-1 rounded-full bg-primary-500 dark:bg-primary-400"
                        />
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule list and form */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>

              {/* Schedules for selected date */}
              <div className="space-y-3 mb-6">
                {getSchedulesForDate(selectedDate).length > 0 ? (
                  getSchedulesForDate(selectedDate).map(schedule => (
                    <div
                      key={schedule.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <ClockIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('exams:maxParticipants')}: {schedule.maxParticipants}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('exams:noSchedules')}
                  </p>
                )}
              </div>

              {/* Add schedule button or form */}
              {showScheduleForm ? (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-md p-4"
                  onSubmit={handleSubmit}
                >
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('exams:addSchedule')}
                  </h4>

                  {/* Start Time */}
                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t('exams:startTime')} *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={newSchedule.startTime}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.startTime
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t('exams:endTime')} *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={newSchedule.endTime}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.endTime
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.endTime}
                      </p>
                    )}
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label
                      htmlFor="maxParticipants"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t('exams:maxParticipants')} *
                    </label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={newSchedule.maxParticipants}
                      onChange={handleChange}
                      min="1"
                      max="500"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.maxParticipants
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.maxParticipants && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.maxParticipants}
                      </p>
                    )}
                  </div>

                  {/* Form actions */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(false)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {t('translation:common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {t('translation:common.add')}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t('exams:addSchedule')}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t('exams:selectDateToSchedule')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamScheduling;
