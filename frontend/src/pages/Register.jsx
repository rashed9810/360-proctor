import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import BackgroundPattern from '../components/common/BackgroundPattern';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import SocialLoginButtons from '../components/common/SocialLoginButtons';
import IconInput from '../components/common/IconInput';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import toast from 'react-hot-toast';

// Icons
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = t('validation.required');
    }

    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch');
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: 'student',
      });

      if (result.success) {
        toast.success(t('registrationSuccessful'));
        navigate('/login', { state: { message: t('registrationSuccessful') } });
      } else {
        toast.error(result.message);
        setErrors({ general: result.message });
      }
    } catch (err) {
      toast.error(t('registrationFailed'));
      setErrors({ general: t('registrationFailed') });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = () => {
    toast.error('Google login not implemented yet');
  };

  const handleFacebookLogin = () => {
    toast.error('Facebook login not implemented yet');
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
            {t('registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('registerSubtitle')}
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

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('fullName')}
                </label>
                <IconInput
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={t('fullName')}
                  value={formData.fullName}
                  onChange={handleChange}
                  icon={UserIcon}
                  error={errors.fullName}
                  isFirst
                  isLast
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('email')}
                </label>
                <IconInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('email')}
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
                  {t('password')}
                </label>
                <div className="relative">
                  <IconInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder={t('password')}
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

                {/* Password Strength Meter */}
                {formData.password && <PasswordStrengthMeter password={formData.password} />}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <IconInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder={t('confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={LockClosedIcon}
                    error={errors.confirmPassword}
                    isFirst
                    isLast
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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
                      className="h-5 w-5 text-primary-500 group-hover:text-primary-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {isLoading ? t('common.loading') : t('signUp')}
              </motion.button>
            </div>

            {/* Social Login Options */}
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
            />
          </form>
        </motion.div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
