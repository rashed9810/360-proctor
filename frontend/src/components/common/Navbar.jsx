import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">{t('appName')}</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/exams"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  {t('exams')}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    {t('adminPanel')}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex md:items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">{user?.full_name}</span>
                <button onClick={handleLogout} className="btn btn-outline text-sm">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn btn-outline text-sm">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/exams"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('exams')}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('adminPanel')}
                  </Link>
                )}
              </>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
              >
                {t('logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
