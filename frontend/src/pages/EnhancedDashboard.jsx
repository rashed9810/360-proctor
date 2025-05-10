import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

// Import components we'll create
import TrustScoreChart from '../components/dashboard/TrustScoreChart';
import ExamCalendar from '../components/dashboard/ExamCalendar';
import LiveProctoring from '../components/dashboard/LiveProctoring';
import NotificationPanel from '../components/dashboard/NotificationPanel';
import StatCard from '../components/dashboard/StatCard';
import OnboardingTutorial from '../components/common/OnboardingTutorial';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const EnhancedDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeExams: 0,
    completedExams: 0,
    violations: 0,
    avgTrustScore: 0,
  });
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [liveExams, setLiveExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Mock data
      setStats({
        totalStudents: 156,
        activeExams: 3,
        completedExams: 24,
        violations: 12,
        avgTrustScore: 0.87,
      });

      setUpcomingExams([
        {
          id: 1,
          title: 'Mathematics Final Exam',
          date: '2023-06-15',
          time: '10:00 AM',
          duration: 120,
          participants: 35,
        },
        {
          id: 2,
          title: 'Physics Midterm',
          date: '2023-06-20',
          time: '2:00 PM',
          duration: 90,
          participants: 28,
        },
      ]);

      setRecentExams([
        {
          id: 3,
          title: 'Chemistry Quiz',
          date: '2023-06-01',
          time: '11:00 AM',
          duration: 45,
          score: 85,
          trustScore: 0.92,
          violations: 1,
        },
        {
          id: 4,
          title: 'Biology Test',
          date: '2023-05-28',
          time: '9:00 AM',
          duration: 60,
          score: 78,
          trustScore: 0.85,
          violations: 3,
        },
      ]);

      setLiveExams([
        {
          id: 5,
          title: 'Computer Science Exam',
          startTime: '9:30 AM',
          duration: 180,
          participants: 42,
          activeParticipants: 40,
          violations: 5,
        },
        {
          id: 6,
          title: 'English Literature Quiz',
          startTime: '10:15 AM',
          duration: 45,
          participants: 38,
          activeParticipants: 37,
          violations: 2,
        },
      ]);

      setNotifications([
        {
          id: 1,
          type: 'alert',
          message: 'Multiple people detected in Computer Science Exam',
          examId: 5,
          studentName: 'John Doe',
          time: '10:15 AM',
          read: false,
        },
        {
          id: 2,
          type: 'warning',
          message: 'Tab switching detected in English Literature Quiz',
          examId: 6,
          studentName: 'Jane Smith',
          time: '10:22 AM',
          read: false,
        },
        {
          id: 3,
          type: 'info',
          message: 'Physics Midterm scheduled for next week',
          examId: 2,
          time: 'Yesterday',
          read: true,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Onboarding Tutorial */}
      <OnboardingTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Header with welcome message and notification bell */}
      <div className="flex justify-between items-center dashboard-welcome">
        <motion.h1 className="text-2xl font-bold text-gray-900" variants={itemVariants}>
          {t('welcomeBack')}, {user?.name}
        </motion.h1>

        <motion.div className="flex items-center space-x-2" variants={itemVariants}>
          {/* Help button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('tutorial.startTour')}
          >
            <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" />
          </button>

          {/* Notification bell */}
          <div className="relative notification-bell">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <BellAlertIcon className="h-6 w-6 text-gray-500" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stats-section"
        variants={itemVariants}
      >
        <StatCard
          title={t('totalStudents')}
          value={stats.totalStudents}
          icon={<UsersIcon className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title={t('activeExams')}
          value={stats.activeExams}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title={t('completedExams')}
          value={stats.completedExams}
          icon={<CheckCircleIcon className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title={t('violations')}
          value={stats.violations}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title={t('avgTrustScore')}
          value={`${Math.round(stats.avgTrustScore * 100)}%`}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          color="yellow"
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Proctoring Section */}
        <motion.div className="lg:col-span-2 live-proctoring-section" variants={itemVariants}>
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                <EyeIcon className="h-5 w-5 inline mr-2 text-primary-500" />
                {t('liveProctoring')}
              </h2>
              <Link
                to="/exams/live"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {t('viewAll')}
              </Link>
            </div>

            <LiveProctoring exams={liveExams} />
          </div>
        </motion.div>

        {/* Trust Score Chart */}
        <motion.div className="trust-score-section" variants={itemVariants}>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('trustScoreAnalytics')}</h2>
            <TrustScoreChart data={recentExams} />
          </div>
        </motion.div>
      </div>

      {/* Upcoming Exams and Calendar */}
      <motion.div className="upcoming-exams-section" variants={itemVariants}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('upcomingExams')}</h2>
            <Link
              to="/exams"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {t('viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExamCalendar exams={upcomingExams} />

            <div>
              {upcomingExams.length === 0 ? (
                <p className="text-gray-500">{t('noExamsFound')}</p>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.map(exam => (
                    <div
                      key={exam.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                        <span className="text-sm text-gray-500">{exam.date}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <span>
                          {exam.time} • {exam.duration} {t('minutes')}
                        </span>
                        <span>
                          {exam.participants} {t('participants')}
                        </span>
                      </div>
                      <div className="mt-3">
                        <Link
                          to={`/exams/${exam.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {t('viewDetails')} →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedDashboard;
