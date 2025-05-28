import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TakeExam = () => {
  const { t } = useTranslation();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [trustScore, setTrustScore] = useState(1.0);
  const [alerts, setAlerts] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Simulate fetching exam data
    setTimeout(() => {
      // Mock data
      setExam({
        id: parseInt(examId),
        title: 'Mathematics Final Exam',
        description: 'Comprehensive exam covering all topics from the semester',
        duration: 120, // minutes
        questions: [
          {
            id: 1,
            text: 'What is the derivative of f(x) = x²?',
            type: 'multiple_choice',
            options: ["f'(x) = x", "f'(x) = 2x", "f'(x) = 2", "f'(x) = x²"],
            correctAnswer: 1,
          },
          {
            id: 2,
            text: 'Solve the equation: 2x + 5 = 15',
            type: 'multiple_choice',
            options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 5/2'],
            correctAnswer: 0,
          },
          {
            id: 3,
            text: 'What is the integral of f(x) = 2x?',
            type: 'multiple_choice',
            options: ['F(x) = x²', 'F(x) = x² + C', 'F(x) = 2x² + C', 'F(x) = x² / 2 + C'],
            correctAnswer: 1,
          },
        ],
        proctoring: {
          faceDetection: true,
          multipleFaceDetection: true,
          eyeTracking: true,
          audioDetection: true,
          tabSwitchDetection: true,
          phoneDetection: true,
        },
      });

      setIsLoading(false);
    }, 1000);

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    // Handle tab switching detection
    const handleVisibilityChange = () => {
      if (isStarted && document.visibilityState === 'hidden') {
        addAlert({
          type: 'tab_switch',
          severity: 'warning',
          message: t('tabSwitchDetected'),
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isStarted, t]);

  const startExam = async () => {
    try {
      // Request camera and microphone permissions
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      // Start the exam
      setIsStarted(true);
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds

      // Start the timer
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endExam();
            return 0;
          }
          return prev - 1;
        });

        // Simulate proctoring checks
        if (isStarted) {
          captureAndAnalyze();
        }
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera or microphone:', error);
      alert(t('cameraAccessError'));
    }
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simulate AI analysis (random alerts for demo)
    if (Math.random() < 0.05) {
      // 5% chance of generating an alert
      const alertTypes = ['face_not_detected', 'multiple_faces', 'looking_away', 'audio_detected'];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

      addAlert({
        type: randomType,
        severity: randomType === 'multiple_faces' ? 'critical' : 'warning',
        message: t(`alert_${randomType}`),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const addAlert = alert => {
    setAlerts(prev => [...prev, alert]);

    // Update trust score based on alert severity
    setTrustScore(prev => {
      const impact = alert.severity === 'critical' ? 0.1 : 0.05;
      return Math.max(0, prev - impact);
    });
  };

  const endExam = () => {
    // Stop the timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Stop the camera and microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Navigate to results page (mock for now)
    alert(t('examCompleted'));
    navigate(`/exams/${examId}/results`);
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="card">
        <p className="text-gray-500">{t('examNotFound')}</p>
        <button onClick={() => navigate('/exams')} className="btn btn-primary mt-4">
          {t('backToExams')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isStarted ? (
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{exam.title}</h1>
            <p className="text-gray-600 mb-6">{exam.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {exam.duration} {t('minutes')}
                </span>
              </div>

              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  {exam.questions.length} {t('questions')}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h3 className="text-yellow-800 font-medium mb-2">{t('proctorRequirements')}</h3>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>{t('requireCamera')}</li>
                <li>{t('requireMicrophone')}</li>
                <li>{t('stayOnTab')}</li>
                <li>{t('stayAlone')}</li>
                <li>{t('noPhoneAllowed')}</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button onClick={startExam} className="btn btn-primary px-8 py-3">
                {t('startExam')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-500">
                    {t('timeLeft')}: <span className="text-gray-900">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {t('trustScore')}:{' '}
                    <span
                      className={`${
                        trustScore > 0.8
                          ? 'text-green-600'
                          : trustScore > 0.6
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {Math.round(trustScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-8 mb-6">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {index + 1}. {question.text}
                    </h3>

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={optionIndex}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={endExam} className="btn btn-primary">
                  {t('submitExam')}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('proctoring')}</h2>

              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div
                className={`p-2 rounded-md text-sm font-medium ${
                  trustScore > 0.8
                    ? 'bg-green-50 text-green-800'
                    : trustScore > 0.6
                      ? 'bg-yellow-50 text-yellow-800'
                      : 'bg-red-50 text-red-800'
                }`}
              >
                {trustScore > 0.8
                  ? t('goodBehavior')
                  : trustScore > 0.6
                    ? t('someIssuesDetected')
                    : t('multipleIssuesDetected')}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('alerts')}</h2>

              {alerts.length === 0 ? (
                <p className="text-gray-500">{t('noAlerts')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md text-sm ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-xs opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;
