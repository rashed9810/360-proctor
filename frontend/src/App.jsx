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
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import TestPage from './pages/TestPage';
import ProctorDemo from './pages/ProctorDemo';

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
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/" element={<PrivateRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="exams" element={<Exams />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="proctor" element={<ProctorDemo />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
