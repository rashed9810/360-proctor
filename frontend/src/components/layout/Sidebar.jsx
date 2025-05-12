import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
  { name: 'dashboard', href: '/', icon: HomeIcon },
  { name: 'students', href: '/students', icon: UsersIcon },
  { name: 'exams', href: '/exams', icon: ClipboardDocumentListIcon },
  { name: 'proctor', href: '/proctor', icon: ShieldCheckIcon },
  { name: 'settings', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, onExpandChange, isMobile }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  // Start with collapsed sidebar
  const [isExpanded, setIsExpanded] = useState(false);

  // Notify parent component when sidebar expansion state changes
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

  return (
    <>
      {/* Mobile sidebar - drawer style for small screens */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-50 lg:hidden" onClose={setSidebarOpen}>
          {/* Backdrop overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 dark:bg-gray-800 bg-opacity-75" />
          </Transition.Child>

          {/* Sliding sidebar panel */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl theme-transition">
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
                    <span className="sr-only">{t('common.closeSidebar')}</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              {/* Sidebar content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="mt-2 px-2 sm:px-3 space-y-1">
                  {navigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)} // Close sidebar when clicking a link on mobile
                      className={classNames(
                        location.pathname === item.href ||
                          (item.href === '/' && location.pathname === '/') ||
                          (item.href !== '/' && location.pathname.startsWith(item.href))
                          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                        'group flex items-center px-2 sm:px-3 py-2 sm:py-3 text-sm font-medium rounded-r-md transition-all duration-200'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          location.pathname === item.href ||
                            (item.href === '/' && location.pathname === '/') ||
                            (item.href !== '/' && location.pathname.startsWith(item.href))
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'mr-2 sm:mr-3 flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{t(`navigation.${item.name}`)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* User profile section */}
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 theme-transition">
                <div className="flex-shrink-0 group block w-full">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white shadow"
                        src={user?.avatar || 'https://via.placeholder.com/40'}
                        alt=""
                      />
                    </div>
                    <div className="ml-3 max-w-[calc(100%-40px)]">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 capitalize truncate">
                        {user?.role}
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

      {/* Collapsible sidebar for desktop */}
      <div
        className={classNames(
          'hidden lg:block fixed inset-y-0 transition-all duration-300 ease-in-out z-40',
          isExpanded ? 'w-64' : 'w-20'
        )}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        style={{
          width: isExpanded ? '16rem' : '5rem',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <div className="h-full flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg theme-transition">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto scrollbar-thin">
            {/* Navigation links */}
            <nav
              className={classNames(
                'mt-2 flex-1 bg-white dark:bg-gray-800 space-y-1 theme-transition',
                isExpanded ? 'px-3' : 'px-2'
              )}
            >
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href ||
                      (item.href === '/' && location.pathname === '/') ||
                      (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent',
                    'group flex items-center rounded-r-md transition-all duration-200',
                    isExpanded
                      ? 'px-3 py-2.5 text-sm font-medium justify-start'
                      : 'px-2 py-2.5 justify-center'
                  )}
                  title={!isExpanded ? t(`navigation.${item.name}`) : ''}
                >
                  <item.icon
                    className={classNames(
                      location.pathname === item.href ||
                        (item.href === '/' && location.pathname === '/') ||
                        (item.href !== '/' && location.pathname.startsWith(item.href))
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'flex-shrink-0 h-5 w-5 md:h-6 md:w-6',
                      isExpanded ? 'mr-3' : ''
                    )}
                    aria-hidden="true"
                  />
                  {isExpanded && (
                    <span className="transition-opacity duration-200 whitespace-nowrap overflow-hidden truncate">
                      {t(`navigation.${item.name}`)}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile section */}
          <div
            className={classNames(
              'flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 theme-transition',
              isExpanded ? 'p-4' : 'p-2'
            )}
          >
            <div className="flex-shrink-0 w-full group block">
              <div className={classNames('flex items-center', isExpanded ? '' : 'justify-center')}>
                <div className="flex-shrink-0">
                  <img
                    className="inline-block h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white shadow"
                    src={user?.avatar || 'https://via.placeholder.com/40'}
                    alt=""
                  />
                </div>
                {isExpanded && (
                  <div className="ml-3 transition-opacity duration-200 overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 capitalize truncate">
                      {user?.role}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-3 -right-3 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 theme-transition"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
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
