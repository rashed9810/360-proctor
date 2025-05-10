import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../common/LanguageSwitcher';
import UserProfileDropdown from '../common/UserProfileDropdown';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ onMenuClick, isMobile, isTablet }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="relative z-30 flex-shrink-0 flex h-14 sm:h-16 bg-white shadow-sm border-b border-gray-200">
      {/* Mobile menu button - visible on mobile and tablet */}
      <button
        type="button"
        className="px-3 sm:px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        onClick={onMenuClick}
        aria-label={t('common.openSidebar')}
      >
        <span className="sr-only">{t('common.openSidebar')}</span>
        <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 px-2 sm:px-4 flex justify-between">
        {/* Left side - Search and title */}
        <div className="flex-1 flex items-center">
          {/* Search bar - hidden on smallest screens */}
          <div className="hidden sm:block max-w-xs lg:max-w-md relative mr-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('common.search')}
              />
            </div>
          </div>

          {/* Page title - hidden on mobile and tablet */}
          <div className="hidden lg:block text-lg xl:text-xl font-semibold text-gray-800">
            {/* Page title could go here */}
          </div>
        </div>

        {/* Right side - Actions and profile */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Language switcher - hidden on smallest screens */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="select" position="navbar" />
          </div>

          {/* Search button - visible only on smallest screens */}
          <button
            type="button"
            className="sm:hidden p-1.5 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label={t('common.search')}
          >
            <span className="sr-only">{t('common.search')}</span>
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative transition-colors duration-200"
            aria-label={t('dashboard.notifications')}
          >
            <span className="sr-only">{t('dashboard.notifications')}</span>
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
