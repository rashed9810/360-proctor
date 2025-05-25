import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const ExamList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Mock data
      setExams([
        {
          id: 1,
          title: 'Mathematics Final Exam',
          description: 'Comprehensive exam covering all topics from the semester',
          date: '2023-06-15',
          time: '10:00 AM',
          duration: 120,
          status: 'published',
        },
        {
          id: 2,
          title: 'Physics Midterm',
          description: 'Covers mechanics, thermodynamics, and waves',
          date: '2023-06-20',
          time: '2:00 PM',
          duration: 90,
          status: 'published',
        },
        {
          id: 3,
          title: 'Chemistry Quiz',
          description: 'Short quiz on organic chemistry',
          date: '2023-06-01',
          time: '11:00 AM',
          duration: 45,
          status: 'completed',
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('exams')}</h1>

        {user?.role !== 'student' && (
          <Link to="/exams/create" className="btn btn-primary">
            {t('createExam')}
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">{t('noExamsFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div key={exam.id} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{exam.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{exam.date}</span>
                </div>

                <div className="flex items-center text-sm">
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
                    {exam.time} ({exam.duration} {t('minutes')})
                  </span>
                </div>

                <div className="flex items-center text-sm">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={`capitalize ${
                      exam.status === 'published'
                        ? 'text-green-600'
                        : exam.status === 'completed'
                          ? 'text-gray-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {t(exam.status)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link to={`/exams/${exam.id}`} className="btn btn-outline text-sm">
                  {t('view')}
                </Link>

                {exam.status === 'published' && user?.role === 'student' && (
                  <Link to={`/take-exam/${exam.id}`} className="btn btn-primary text-sm">
                    {t('startExam')}
                  </Link>
                )}

                {user?.role !== 'student' && (
                  <Link to={`/exams/${exam.id}/edit`} className="btn btn-secondary text-sm">
                    {t('edit')}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
