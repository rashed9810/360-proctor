import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserProfileDropdown() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
          <img
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full sm:mr-2"
            src={user?.avatar || 'https://via.placeholder.com/40'}
            alt={user?.name || 'User'}
          />
          <span className="hidden md:block max-w-[100px] lg:max-w-[150px] truncate">
            {user?.name}
          </span>
          <ChevronDownIcon
            className="hidden sm:block ml-1 -mr-1 h-4 w-4 sm:h-5 sm:w-5"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm transition-colors duration-150'
                  )}
                >
                  <UserIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {t('dashboard.profile')}
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm transition-colors duration-150'
                  )}
                >
                  <Cog6ToothIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {t('dashboard.settings')}
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm w-full transition-colors duration-150'
                  )}
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {t('auth.logout')}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
