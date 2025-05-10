import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import ResponsiveDashboard from './pages/ResponsiveDashboard';
import ResponsiveStudents from './pages/ResponsiveStudents';
import ResponsiveExams from './pages/ResponsiveExams';

function ResponsiveApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResponsiveLayout />}>
          <Route index element={<ResponsiveDashboard />} />
          <Route path="students" element={<ResponsiveStudents />} />
          <Route path="exams" element={<ResponsiveExams />} />
          <Route path="analytics" element={<div className="p-4">Analytics Page (Coming Soon)</div>} />
          <Route path="notifications" element={<div className="p-4">Notifications Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default ResponsiveApp;
