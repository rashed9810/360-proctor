import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import NotificationSystem from '../notifications/NotificationSystem';
import ThemeToggle from '../common/ThemeToggle';

// Helper function to combine class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ResponsiveNavbar({ onMenuClick, isMobile, isTablet }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle search input change
  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submit
  const handleSearchSubmit = e => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality
  };
  return (
    <div className="relative z-30 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Mobile menu button */}
      <button
        type="button"
        className="px-3 sm:px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors duration-200"
        onClick={onMenuClick}
        aria-label={t('openSidebar')}
      >
        <span className="sr-only">{t('openSidebar')}</span>
        <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        {/* Search bar */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-xs lg:max-w-md">
            <label htmlFor="search" className="sr-only">
              {t('search')}
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                className={`flex items-center text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300 transition-colors duration-200 ${
                  isSearchFocused ? 'ring-2 ring-primary-500 rounded-md' : ''
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                  placeholder={t('search')}
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right side navbar items */}
        <div className="ml-4 flex items-center md:ml-6 space-x-2 sm:space-x-4">
          {/* Language selector - simplified for this example */}
          <div className="hidden sm:block">
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center" id="notification-bell">
            <NotificationSystem />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center" id="theme-toggle">
            <ThemeToggle />
          </div>

          {/* Profile dropdown */}
          <Menu as="div" className="ml-3 relative">
            <div>
              <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/40"
                  alt="User avatar"
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#profile"
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Your Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#settings"
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#signout"
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <ArrowRightOnRectangleIcon
                        className="mr-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Sign out
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}
