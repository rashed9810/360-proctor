import { Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n.js';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Exams from './pages/Exams';
import ExamListPage from './pages/exams/ExamListPage';
import CreateExam from './pages/exams/CreateExam';
import ExamDetail from './pages/exams/ExamDetail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import TestPage from './pages/TestPage';
import ProctorDemo from './pages/ProctorDemo';
import EnhancedStudentAssignmentPage from './pages/EnhancedStudentAssignmentPage';

// Admin pages
import AdminProfile from './pages/admin/AdminProfile';
import UserManagement from './pages/admin/UserManagement';

// Proctoring pages
import LiveProctoring from './pages/proctoring/LiveProctoring';

// Analytics pages
import AdvancedAnalytics from './pages/analytics/AdvancedAnalytics';
import EnhancedAnalyticsPage from './pages/analytics/EnhancedAnalyticsPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';

// Private Route Component - moved inside the providers
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout />;
};

// App Routes Component - contains all routes and uses auth context
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exams/list" element={<ExamListPage />} />
        <Route path="exams/create" element={<CreateExam />} />
        <Route path="exams/:id" element={<ExamDetail />} />
        <Route path="exams/:id/edit" element={<CreateExam />} />
        <Route path="exams/:examId/students" element={<EnhancedStudentAssignmentPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="proctor" element={<ProctorDemo />} />

        {/* Admin Routes */}
        <Route path="admin/profile" element={<AdminProfile />} />
        <Route path="admin/users" element={<UserManagement />} />

        {/* Proctoring Routes */}
        <Route path="proctoring/live/:examId" element={<LiveProctoring />} />

        {/* Analytics Routes */}
        <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
        <Route path="analytics/enhanced" element={<EnhancedAnalyticsPage />} />

        {/* Student Routes */}
        <Route path="student/dashboard" element={<StudentDashboard />} />
      </Route>
      {/* Catch-all route for debugging */}
      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1>
            <p className="mt-4">The page you're looking for doesn't exist.</p>
            <p className="mt-2">Current path: {window.location.pathname}</p>
            <a href="/login" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
              Go to Login
            </a>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--card-bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                },
                success: {
                  iconTheme: {
                    primary: '#0ea5e9',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
