import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Exams', href: '/exams', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

// Helper function to combine class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ResponsiveSidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  onExpandChange,
  isMobile
}) {
  const location = useLocation();
  // Start with collapsed sidebar on desktop
  const [isExpanded, setIsExpanded] = useState(false);

  // Notify parent component when sidebar expansion state changes
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

  return (
    <>
      {/* Mobile sidebar - slides in from the left */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="fixed inset-0 flex z-50 md:hidden" 
          onClose={setSidebarOpen}
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          
          {/* Sidebar panel */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              {/* Close button */}
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              
              {/* Sidebar content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center justify-center px-4 mb-5">
                  <img className="h-10 w-auto" src="/logo.svg" alt="Admin Dashboard" />
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)} // Close sidebar when clicking a link on mobile
                      className={classNames(
                        location.pathname === item.href ||
                          (item.href === '/' && location.pathname === '/')
                          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                        'group flex items-center px-3 py-3 text-base font-medium rounded-r-md transition-all duration-200'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          location.pathname === item.href ||
                            (item.href === '/' && location.pathname === '/')
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'mr-4 flex-shrink-0 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* User profile section */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex-shrink-0 group block w-full">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="inline-block h-10 w-10 rounded-full border-2 border-white shadow"
                        src="https://via.placeholder.com/40"
                        alt="User avatar"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 truncate">
                        Admin User
                      </p>
                      <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 capitalize truncate">
                        Administrator
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar - collapsible */}
      <div
        className={classNames(
          'hidden md:block md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-40',
          isExpanded ? 'w-64' : 'w-20'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          width: isExpanded ? '16rem' : '5rem',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <div className="h-full flex flex-col border-r border-gray-200 bg-white shadow-lg">
          {/* Logo and navigation */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div
              className={classNames(
                'flex items-center justify-center flex-shrink-0 mb-5',
                isExpanded ? 'px-4' : 'px-2'
              )}
            >
              <img
                className={classNames(
                  'transition-all duration-300',
                  isExpanded ? 'h-10 w-auto' : 'h-8 w-auto'
                )}
                src="/logo.svg"
                alt="Admin Dashboard"
              />
            </div>
            
            {/* Navigation links */}
            <nav
              className={classNames('mt-2 flex-1 bg-white space-y-2', isExpanded ? 'px-3' : 'px-2')}
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href ||
                      (item.href === '/' && location.pathname === '/')
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                    'group flex items-center rounded-r-md transition-all duration-200',
                    isExpanded
                      ? 'px-3 py-3 text-sm font-medium justify-start'
                      : 'px-2 py-3 justify-center'
                  )}
                >
                  <item.icon
                    className={classNames(
                      location.pathname === item.href ||
                        (item.href === '/' && location.pathname === '/')
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'flex-shrink-0 h-6 w-6',
                      isExpanded ? 'mr-3' : ''
                    )}
                    aria-hidden="true"
                  />
                  {isExpanded && (
                    <span className="transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User profile section */}
          <div
            className={classNames(
              'flex-shrink-0 flex border-t border-gray-200 bg-gray-50',
              isExpanded ? 'p-4' : 'p-2'
            )}
          >
            <div className="flex-shrink-0 w-full group block">
              <div className={classNames('flex items-center', isExpanded ? '' : 'justify-center')}>
                <div className="flex-shrink-0">
                  <img
                    className="inline-block h-10 w-10 rounded-full border-2 border-white shadow"
                    src="https://via.placeholder.com/40"
                    alt="User avatar"
                  />
                </div>
                {isExpanded && (
                  <div className="ml-3 transition-opacity duration-200 overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                      Admin User
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 capitalize truncate">
                      Administrator
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Toggle button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-3 -right-3 bg-white rounded-full p-1 shadow-md border border-gray-200 text-gray-500 hover:text-indigo-600 focus:outline-none"
          >
            <ChevronRightIcon 
              className={classNames(
                'h-4 w-4 transition-transform duration-300',
                isExpanded ? 'rotate-180' : ''
              )} 
            />
          </button>
        </div>
      </div>
    </>
  );
}
