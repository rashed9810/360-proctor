import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import UserProfileDropdown from '../common/UserProfileDropdown';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from '../common/NotificationBell';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ onMenuClick, isMobile, isTablet }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative z-30 flex-shrink-0 flex h-14 sm:h-16 theme-transition bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Mobile menu button - visible on mobile and tablet */}
      <button
        type="button"
        className="px-3 sm:px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors duration-200"
        onClick={onMenuClick}
        aria-label={t('common.openSidebar')}
      >
        <span className="sr-only">{t('common.openSidebar')}</span>
        <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 flex justify-between items-center">
        {/* Center section - Search bar */}
        <div className="flex-1 flex justify-center items-center px-2 sm:px-4 relative">
          {/* Desktop search bar - centered and with proper spacing */}
          <div
            className={`hidden sm:block w-full max-w-md mx-auto transition-all duration-300 ${searchOpen ? 'sm:max-w-lg' : ''}`}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder={t('common.search')}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>

          {/* Mobile search overlay - full screen when active */}
          <Transition
            show={searchOpen && isMobile}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="absolute inset-0 z-50 bg-white dark:bg-gray-800 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('common.search')}
                </h2>
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={() => setSearchOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-base placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('common.search')}
                  autoFocus
                />
              </div>
            </div>
          </Transition>
        </div>

        {/* Right side - Actions and profile */}
        <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-4 px-2 sm:px-4">
          {/* Search button - visible only on smallest screens */}
          <button
            type="button"
            className="sm:hidden p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            aria-label={t('common.search')}
            onClick={() => setSearchOpen(true)}
          >
            <span className="sr-only">{t('common.search')}</span>
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Theme toggle with tooltip */}
          <div className="relative group">
            <ThemeToggle size={isMobile ? 'sm' : 'md'} />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {t('settings.toggleTheme')}
              </div>
            </div>
          </div>

          {/* Language switcher with improved styling */}
          <div className="hidden sm:block relative group">
            <LanguageSwitcher variant="select" position="navbar" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {t('common.language')}
              </div>
            </div>
          </div>

          {/* Notifications with tooltip */}
          <div className="relative group">
            <NotificationBell size={isMobile ? 'sm' : 'md'} />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {t('notifications.title')}
              </div>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
