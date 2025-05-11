import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import OnboardingTour from './components/onboarding/OnboardingTour';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';

// Lazy load page components
const ResponsiveDashboard = lazy(() => import('./pages/ResponsiveDashboard'));
const ResponsiveStudents = lazy(() => import('./pages/ResponsiveStudents'));
const ResponsiveExams = lazy(() => import('./pages/ResponsiveExams'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const CalendarView = lazy(() => import('./pages/CalendarView'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function ResponsiveApp() {
  const [isNewUser, setIsNewUser] = useState(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    return !hasCompletedOnboarding;
  });

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsNewUser(false);
  };

  return (
    <Router>
      <KeyboardShortcuts enabled={true} />
      <OnboardingTour isNewUser={isNewUser} onComplete={handleOnboardingComplete} enabled={true} />
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
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="calendar" element={<CalendarView />} />
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
