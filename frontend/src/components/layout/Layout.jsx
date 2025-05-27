import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RealTimeNotifications from '../notifications/RealTimeNotifications';

export default function Layout() {
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
    <div className="min-h-screen flex flex-col theme-transition bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay - only shows on mobile/tablet when sidebar is open */}
      {sidebarOpen && (isMobile || isTablet) && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-800 bg-opacity-75 z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <Sidebar
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
        <Navbar onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} isTablet={isTablet} />

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none theme-transition">
          <div className="py-3 sm:py-4 md:py-6">
            <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="content-wrapper">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Real-Time Notifications */}
      <RealTimeNotifications />
    </div>
  );
}
