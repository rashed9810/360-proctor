import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ResponsiveLayout from './components/layout/ResponsiveLayout';

// Lazy load page components
const ResponsiveDashboard = lazy(() => import('./pages/ResponsiveDashboard'));
const ResponsiveStudents = lazy(() => import('./pages/ResponsiveStudents'));
const ResponsiveExams = lazy(() => import('./pages/ResponsiveExams'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function ResponsiveApp() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<ResponsiveLayout />}>
            <Route index element={<ResponsiveDashboard />} />
            <Route path="students" element={<ResponsiveStudents />} />
            <Route path="exams" element={<ResponsiveExams />} />
            <Route
              path="analytics"
              element={<div className="p-4">Analytics Page (Coming Soon)</div>}
            />
            <Route
              path="notifications"
              element={<div className="p-4">Notifications Page (Coming Soon)</div>}
            />
            <Route
              path="settings"
              element={<div className="p-4">Settings Page (Coming Soon)</div>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default ResponsiveApp;
