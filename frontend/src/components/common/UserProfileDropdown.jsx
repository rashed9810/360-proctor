import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UsersIcon,
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
        <Menu.Button className="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
            <img
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full sm:mr-2 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all duration-200"
              src={user?.avatar || '/assets/images/default-avatar.svg'}
              alt={user?.name || 'User'}
            />
            <span className="absolute -bottom-1 -right-1 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
          </motion.div>
          <span className="hidden md:block max-w-[100px] lg:max-w-[150px] truncate">
            {user?.name}
          </span>
          <ChevronDownIcon
            className="hidden sm:block ml-1 -mr-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-180"
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

            {/* Admin-specific menu items */}
            {user?.role === 'admin' && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/users"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'group flex items-center px-4 py-2 text-sm transition-colors duration-150'
                      )}
                    >
                      <UsersIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      {t('admin.manageUsers')}
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/security"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'group flex items-center px-4 py-2 text-sm transition-colors duration-150'
                      )}
                    >
                      <ShieldCheckIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      {t('admin.security')}
                    </Link>
                  )}
                </Menu.Item>
              </>
            )}
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
                  <ArrowRightStartOnRectangleIcon
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
