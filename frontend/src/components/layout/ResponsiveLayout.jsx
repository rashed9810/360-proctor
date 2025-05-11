import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveNavbar from './ResponsiveNavbar';
import ResponsiveSidebar from './ResponsiveSidebar';
import NotificationSystem from '../notifications/NotificationSystem';
import FeedbackForm from '../common/FeedbackForm';
import QuickActionPanel from '../dashboard/QuickActionPanel';

/**
 * Responsive layout component
 */
export default function ResponsiveLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { theme } = useTheme();

  // Function to handle window resize and detect device type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Close mobile sidebar on larger screens
      if (width >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay - darkens the screen when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-800 bg-opacity-75 z-20 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <ResponsiveSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onExpandChange={setIsSidebarExpanded}
        isMobile={isMobile || isTablet}
      />

      {/* Main content wrapper */}
      <div
        className="flex flex-col flex-1 w-full transition-all duration-300"
        style={{
          marginLeft: !isMobile && !isTablet ? (isSidebarExpanded ? '16rem' : '5rem') : '0',
          width:
            !isMobile && !isTablet
              ? `calc(100% - ${isSidebarExpanded ? '16rem' : '5rem'})`
              : '100%',
        }}
      >
        {/* Top navigation */}
        <ResponsiveNavbar 
          onMenuClick={() => setSidebarOpen(true)} 
          isMobile={isMobile} 
          isTablet={isTablet}
        />

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-200">
          <div className="py-3 sm:py-4 md:py-6">
            <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="content-wrapper">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification System */}
      <NotificationSystem />

      {/* Feedback Form */}
      <FeedbackForm />

      {/* Quick Action Panel */}
      <QuickActionPanel />
    </div>
  );
}
