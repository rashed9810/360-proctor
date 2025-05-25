import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { examService, proctorService } from '../../api';
import toast from 'react-hot-toast';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LoadingPage, LoadingSpinner } from '../../components/ui/Loading';

// Icons
import {
  VideoCameraIcon,
  MicrophoneIcon,
  EyeIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CameraIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

/**
 * Live Proctoring Interface Component
 * Real-time monitoring dashboard for exam proctoring
 */
const LiveProctoring = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['proctoring', 'common']);
  const { user } = useAuth();

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // State management
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [monitoringStats, setMonitoringStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    violations: 0,
    averageTrustScore: 0,
  });

  // Proctoring settings
  const [settings, setSettings] = useState({
    faceDetection: true,
    audioMonitoring: true,
    screenRecording: true,
    tabSwitchDetection: true,
    multiplePersonDetection: true,
    suspiciousActivityDetection: true,
  });

  useEffect(() => {
    if (examId) {
      initializeProctoring();
    }
  }, [examId]);

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(updateMonitoringData, 5000); // Update every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  /**
   * Initialize proctoring session
   */
  const initializeProctoring = async () => {
    try {
      setIsLoading(true);

      // Fetch exam details
      const examResponse = await examService.getExamById(examId);
      if (examResponse.success) {
        setExam(examResponse.data);
      }

      // Fetch students taking the exam
      const studentsResponse = await examService.getExamStudents(examId);
      if (studentsResponse.success) {
        setStudents(studentsResponse.data);
        setMonitoringStats(prev => ({
          ...prev,
          totalStudents: studentsResponse.data.length,
          activeStudents: studentsResponse.data.filter(s => s.status === 'active').length,
        }));
      }

      // Initialize camera and monitoring
      await initializeCamera();
    } catch (error) {
      console.error('Error initializing proctoring:', error);
      toast.error(t('common.errorInitializing'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize camera for monitoring
   */
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error(t('proctoring.cameraError'));
    }
  };

  /**
   * Start monitoring session
   */
  const startMonitoring = async () => {
    try {
      setIsMonitoring(true);

      // Start proctoring session
      const response = await proctorService.startSession(examId, settings);
      if (response.success) {
        toast.success(t('proctoring.monitoringStarted'));

        // Start real-time monitoring
        startRealTimeMonitoring();
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error(t('proctoring.startError'));
      setIsMonitoring(false);
    }
  };

  /**
   * Stop monitoring session
   */
  const stopMonitoring = async () => {
    try {
      setIsMonitoring(false);

      // Stop proctoring session
      const response = await proctorService.stopSession(examId);
      if (response.success) {
        toast.success(t('proctoring.monitoringStopped'));
      }

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      toast.error(t('proctoring.stopError'));
    }
  };

  /**
   * Start real-time monitoring with AI detection
   */
  const startRealTimeMonitoring = () => {
    // This would integrate with AI models for:
    // - Face detection and recognition
    // - Multiple person detection
    // - Suspicious activity detection
    // - Audio analysis
    // - Screen monitoring

    // For now, simulate monitoring with mock data
    simulateMonitoring();
  };

  /**
   * Simulate monitoring data (replace with real AI integration)
   */
  const simulateMonitoring = () => {
    // Simulate violations and monitoring data
    const mockViolations = [
      {
        id: 1,
        studentId: 'student1',
        studentName: 'John Doe',
        type: 'face_not_detected',
        severity: 'high',
        timestamp: new Date(),
        description: 'Face not detected for 30 seconds',
      },
      {
        id: 2,
        studentId: 'student2',
        studentName: 'Jane Smith',
        type: 'multiple_persons',
        severity: 'critical',
        timestamp: new Date(),
        description: 'Multiple persons detected in frame',
      },
      {
        id: 3,
        studentId: 'student3',
        studentName: 'Bob Johnson',
        type: 'tab_switch',
        severity: 'medium',
        timestamp: new Date(),
        description: 'Tab switch detected',
      },
    ];

    setViolations(mockViolations);
    setMonitoringStats(prev => ({
      ...prev,
      violations: mockViolations.length,
      averageTrustScore: 0.85,
    }));
  };

  /**
   * Update monitoring data
   */
  const updateMonitoringData = async () => {
    try {
      // Fetch latest monitoring data
      const response = await proctorService.getMonitoringData(examId);
      if (response.success) {
        setViolations(response.data.violations);
        setMonitoringStats(response.data.stats);
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error updating monitoring data:', error);
    }
  };

  /**
   * Handle violation action
   */
  const handleViolationAction = async (violationId, action) => {
    try {
      const response = await proctorService.handleViolation(violationId, action);
      if (response.success) {
        toast.success(t('proctoring.violationHandled'));
        updateMonitoringData();
      }
    } catch (error) {
      console.error('Error handling violation:', error);
      toast.error(t('proctoring.violationError'));
    }
  };

  /**
   * Get violation severity color
   */
  const getViolationColor = severity => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  /**
   * Get violation icon
   */
  const getViolationIcon = type => {
    switch (type) {
      case 'face_not_detected':
        return EyeIcon;
      case 'multiple_persons':
        return UserGroupIcon;
      case 'tab_switch':
        return ComputerDesktopIcon;
      case 'audio_anomaly':
        return SpeakerWaveIcon;
      case 'screen_capture':
        return CameraIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  if (isLoading) {
    return <LoadingPage message={t('proctoring.initializing')} />;
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('proctoring.examNotFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('proctoring.examNotFoundDesc')}
          </p>
          <Button onClick={() => navigate('/exams')}>{t('common.backToExams')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent">
                🔍 {t('proctoring.liveMonitoring')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {exam.title} • {t('proctoring.realTimeMonitoring')}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex space-x-3">
              {!isMonitoring ? (
                <Button variant="success" icon={PlayIcon} onClick={startMonitoring} glow={true}>
                  {t('proctoring.startMonitoring')}
                </Button>
              ) : (
                <Button variant="error" icon={StopIcon} onClick={stopMonitoring}>
                  {t('proctoring.stopMonitoring')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Monitoring Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            className={`flex items-center justify-center p-4 rounded-xl border-2 ${
              isMonitoring
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {isMonitoring ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    {t('proctoring.monitoringActive')}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {t('proctoring.monitoringInactive')}
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Monitoring Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('proctoring.totalStudents')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {monitoringStats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('proctoring.activeStudents')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {monitoringStats.activeStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('proctoring.violations')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {monitoringStats.violations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" shadow="medium" hover="lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('proctoring.avgTrustScore')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(monitoringStats.averageTrustScore * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Monitoring View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card variant="glass" shadow="large" className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    {t('proctoring.proctorView')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover" />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                      style={{ display: 'none' }}
                    />

                    {/* Recording indicator */}
                    {isMonitoring && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>{t('proctoring.recording')}</span>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={VideoCameraIcon}
                        className="bg-black/50 text-white hover:bg-black/70"
                      >
                        {t('proctoring.camera')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={MicrophoneIcon}
                        className="bg-black/50 text-white hover:bg-black/70"
                      >
                        {t('proctoring.microphone')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Student Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card variant="glass" shadow="medium">
                <CardHeader>
                  <CardTitle>
                    👥 {t('proctoring.studentMonitoring')} ({students.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className={`relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          selectedStudent?.id === student.id
                            ? 'ring-2 ring-blue-500'
                            : 'hover:ring-2 hover:ring-gray-400'
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        {/* Student video placeholder */}
                        <div className="aspect-video bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {student.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <p className="text-white text-xs">{student.name}</p>
                          </div>
                        </div>

                        {/* Status indicators */}
                        <div className="absolute top-2 left-2 flex space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              student.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          {student.violations > 0 && (
                            <div className="bg-red-500 text-white text-xs px-1 rounded">
                              {student.violations}
                            </div>
                          )}
                        </div>

                        {/* Trust score */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.round((student.trustScore || 0.85) * 100)}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Violations and Controls */}
          <div className="space-y-6">
            {/* Proctoring Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card variant="glass" shadow="medium">
                <CardHeader>
                  <CardTitle>⚙️ {t('proctoring.settings')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t(`proctoring.${key}`)}
                        </label>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, [key]: !value }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Violations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Card variant="glass" shadow="medium">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>🚨 {t('proctoring.recentViolations')}</span>
                    <span className="text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                      {violations.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {violations.map((violation, index) => {
                        const ViolationIcon = getViolationIcon(violation.type);
                        return (
                          <motion.div
                            key={violation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 rounded-lg border ${getViolationColor(violation.severity)}`}
                          >
                            <div className="flex items-start space-x-3">
                              <ViolationIcon className="h-5 w-5 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{violation.studentName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {violation.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {violation.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViolationAction(violation.id, 'dismiss')}
                                  className="p-1"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {violations.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('proctoring.noViolations')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveProctoring;
