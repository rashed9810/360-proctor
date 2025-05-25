import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const ExamDetails = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Mock data
      setExam({
        id: parseInt(examId),
        title: 'Mathematics Final Exam',
        description:
          'Comprehensive exam covering all topics from the semester including algebra, calculus, and statistics.',
        date: '2023-06-15',
        time: '10:00 AM',
        duration: 120,
        status: 'published',
        creator: {
          id: 2,
          name: 'Dr. John Smith',
        },
        proctoring: {
          faceDetection: true,
          multipleFaceDetection: true,
          eyeTracking: true,
          audioDetection: true,
          tabSwitchDetection: true,
          phoneDetection: true,
        },
        instructions:
          'Please ensure you are in a quiet environment. No books or notes are allowed. You must keep your camera and microphone on throughout the exam.',
      });

      setIsLoading(false);
    }, 1000);
  }, [examId]);

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
        <Link to="/exams" className="btn btn-primary mt-4">
          {t('backToExams')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>

        <div className="flex space-x-2">
          <Link to="/exams" className="btn btn-outline">
            {t('backToExams')}
          </Link>

          {user?.role === 'student' && exam.status === 'published' && (
            <Link to={`/take-exam/${exam.id}`} className="btn btn-primary">
              {t('startExam')}
            </Link>
          )}

          {user?.role !== 'student' && (
            <Link to={`/exams/${exam.id}/edit`} className="btn btn-secondary">
              {t('edit')}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('examDetails')}</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('description')}</h3>
                <p className="mt-1 text-gray-900">{exam.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('instructions')}</h3>
                <p className="mt-1 text-gray-900">{exam.instructions}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('date')}</h3>
                  <p className="mt-1 text-gray-900">{exam.date}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('time')}</h3>
                  <p className="mt-1 text-gray-900">{exam.time}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('duration')}</h3>
                  <p className="mt-1 text-gray-900">
                    {exam.duration} {t('minutes')}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('status')}</h3>
                  <p
                    className={`mt-1 capitalize ${
                      exam.status === 'published'
                        ? 'text-green-600'
                        : exam.status === 'completed'
                          ? 'text-gray-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {t(exam.status)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('creator')}</h3>
                  <p className="mt-1 text-gray-900">{exam.creator.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('proctoring')}</h2>

            <div className="space-y-3">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.faceDetection ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('faceDetection')}</p>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.multipleFaceDetection ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('multipleFaceDetection')}</p>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.eyeTracking ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('eyeTracking')}</p>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.audioDetection ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('audioDetection')}</p>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.tabSwitchDetection ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('tabSwitchDetection')}</p>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${exam.proctoring.phoneDetection ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <p className="ml-3 text-sm text-gray-700">{t('phoneDetection')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
