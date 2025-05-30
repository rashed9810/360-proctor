import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';

// Mock student webcam images (in a real app, these would be live streams)
// Using placeholder images instead of actual files to avoid file dependencies
const mockStudentImages = [
  'https://via.placeholder.com/160x90.png?text=Student+1',
  'https://via.placeholder.com/160x90.png?text=Student+2',
  'https://via.placeholder.com/160x90.png?text=Student+3',
  'https://via.placeholder.com/160x90.png?text=Student+4',
  'https://via.placeholder.com/160x90.png?text=Student+5',
  'https://via.placeholder.com/160x90.png?text=Student+6',
];

const LiveProctoring = ({ exams = [] }) => {
  const { t } = useTranslation();
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id);
  const [studentFeeds, setStudentFeeds] = useState(
    mockStudentImages.map((img, index) => ({
      id: index + 1,
      studentName: `Student ${index + 1}`,
      imageUrl: img,
      hasViolation: index % 3 === 0,
    }))
  );
  const [violations, setViolations] = useState([]);
  const [error, setError] = useState(null);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/proctoring');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'student_feed') {
        setStudentFeeds(prev => [...prev, data.feed]);
      } else if (data.type === 'violation') {
        setViolations(prev => [...prev, data.violation]);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (error && enableNotifications) {
      toast.dismiss();
      toast.error('Analytics connection error', { id: 'analytics-error' });
      setError(null);
    }
  }, [error, enableNotifications]);

  const currentExam = exams.find(exam => exam.id === selectedExam) ||
    exams[0] || {
      id: 1,
      title: 'Demo Exam',
      activeParticipants: 6,
      participants: 10,
      duration: 120,
      violations: 2,
    };

  if (!exams || exams.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <p className="text-gray-500">{t('noActiveExams')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Exam selector tabs with animation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto pb-2">
          {exams.map(exam => (
            <motion.button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                whitespace-nowrap pb-3 px-4 border-b-2 font-medium text-sm
                transition-colors duration-200
                ${
                  selectedExam === exam.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {exam.title}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Enhanced exam stats with animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-blue-700 font-medium">{t('participants')}</p>
              <p className="text-2xl font-bold text-blue-900">
                {currentExam.activeParticipants}/{currentExam.participants}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-green-700 font-medium">{t('duration')}</p>
              <p className="text-2xl font-bold text-green-900">
                {currentExam.duration} {t('minutes')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-red-700 font-medium">{t('violations')}</p>
              <p className="text-2xl font-bold text-red-900">{currentExam.violations}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced student webcam grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('liveStudentFeeds')}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <VideoCameraIcon className="h-4 w-4 mr-1" />
            <span>
              {studentFeeds.length} {t('activeFeeds')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {studentFeeds.map((feed, index) => (
              <motion.div
                key={feed.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-md"
              >
                <img
                  src={feed.imageUrl}
                  alt={`${t('studentFeed')} ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Violation indicator with animation */}
                {feed.hasViolation && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      {t('violation')}
                    </div>
                  </motion.div>
                )}

                {/* Student info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium">{feed.studentName}</p>
                  <div className="flex items-center mt-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-white/80">{t('live')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced view all button */}
      <motion.div className="text-right" whileHover={{ x: 5 }}>
        <Link
          to={`/exams/${currentExam.id}/proctor`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {t('monitorFullScreen')}
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default LiveProctoring;
