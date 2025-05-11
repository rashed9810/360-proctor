import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import BackgroundPattern from '../../components/common/BackgroundPattern';
import SocialLoginButtons from '../../components/common/SocialLoginButtons';
import IconInput from '../../components/common/IconInput';
import toast from 'react-hot-toast';

// Icons
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('validation.required') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail') || 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = t('validation.required') || 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever form data changes
  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [formData, formTouched]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success(t('auth.loginSuccess') || 'Login successful!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || t('auth.loginError');
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = () => {
    toast.error(t('auth.notImplemented') || 'Google login not implemented yet');
  };

  const handleFacebookLogin = () => {
    toast.error(t('auth.notImplemented') || 'Facebook login not implemented yet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* SVG Background Pattern */}
      <BackgroundPattern />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="dropdown" position="auth" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Logo and Header */}
        <div className="text-center">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="mx-auto h-16 w-auto"
            src="/logo.svg"
            alt="360° Proctor"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200"
        >
          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400 dark:text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('auth.email')}
                </label>
                <IconInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                  icon={EnvelopeIcon}
                  error={errors.email}
                  isFirst
                  isLast
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <IconInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={handleChange}
                    icon={LockClosedIcon}
                    error={errors.password}
                    isFirst
                    isLast
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (formTouched && Object.keys(errors).length > 0)}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {loading ? t('common.loading') : t('auth.login')}
              </motion.button>
            </div>

            {/* Social Login Options */}
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
            />
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
            >
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
