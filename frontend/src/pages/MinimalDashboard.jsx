import React from 'react';
import { useTranslation } from 'react-i18next';

const MinimalDashboard = () => {
  const { t } = useTranslation();
  
  // Hardcoded data for demonstration
  const stats = {
    totalStudents: 156,
    activeExams: 3,
    completedExams: 24,
  };
  
  const upcomingExams = [
    {
      id: 1,
      title: 'Mathematics Final Exam',
      date: '2023-06-15',
      time: '10:00 AM',
      duration: 120,
    },
    {
      id: 2,
      title: 'Physics Midterm',
      date: '2023-06-20',
      time: '2:00 PM',
      duration: 90,
    },
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t('dashboard.title')}
      </h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-blue-800">{t('totalStudents')}</h2>
          <p className="text-3xl font-bold text-blue-900">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-green-800">{t('activeExams')}</h2>
          <p className="text-3xl font-bold text-green-900">{stats.activeExams}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-purple-800">{t('completedExams')}</h2>
          <p className="text-3xl font-bold text-purple-900">{stats.completedExams}</p>
        </div>
      </div>
      
      {/* Upcoming Exams */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('upcomingExams')}</h2>
        
        {upcomingExams.length === 0 ? (
          <p className="text-gray-500">{t('noExamsFound')}</p>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map(exam => (
              <div key={exam.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{exam.title}</h3>
                  <span className="text-sm text-gray-500">{exam.date}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {exam.time} • {exam.duration} {t('minutes')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t('quickActions')}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100">
            <span className="block text-indigo-800 font-medium">{t('createExam')}</span>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100">
            <span className="block text-green-800 font-medium">{t('addStudent')}</span>
          </button>
          
          <button className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100">
            <span className="block text-yellow-800 font-medium">{t('viewReports')}</span>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100">
            <span className="block text-purple-800 font-medium">{t('settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboard;
