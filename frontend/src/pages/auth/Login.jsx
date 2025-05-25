import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import BackgroundPattern from '../../components/common/BackgroundPattern';
import SocialLoginButtons from '../../components/common/SocialLoginButtons';
import toast from 'react-hot-toast';

// New UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/Loading';

// Icons
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* SVG Background Pattern */}
      <BackgroundPattern />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LanguageSwitcher variant="dropdown" position="auth" />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative mx-auto h-20 w-20 mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg" />
            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            {/* Sparkles around logo */}
            <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
            <SparklesIcon
              className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-400 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            360° Proctor
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
          >
            {t('auth.login')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 dark:text-gray-400"
          >
            {t('auth.loginSubtitle') || 'Welcome back! Please sign in to your account.'}
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <Card
          variant="glass"
          shadow="large"
          hover="lift"
          animate={true}
          delay={0.6}
          className="backdrop-blur-xl border-white/20 dark:border-gray-700/30"
        >
          {/* Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/30 backdrop-blur-sm"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-red-600 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errors.general}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Input
                  label={t('auth.email')}
                  type="email"
                  name="email"
                  placeholder={t('auth.email') || 'Enter your email'}
                  value={formData.email}
                  onChange={handleChange}
                  icon={EnvelopeIcon}
                  error={errors.email}
                  animate={true}
                  autoComplete="email"
                  required
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Input
                  label={t('auth.password')}
                  type="password"
                  name="password"
                  placeholder={t('auth.password') || 'Enter your password'}
                  value={formData.password}
                  onChange={handleChange}
                  icon={LockClosedIcon}
                  error={errors.password}
                  animate={true}
                  showPasswordToggle={true}
                  autoComplete="current-password"
                  required
                />
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      formData.rememberMe
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                    }`}
                  >
                    {formData.rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
                    {t('auth.rememberMe') || 'Remember me'}
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                >
                  {t('auth.forgotPassword') || 'Forgot password?'}
                </Link>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading || (formTouched && Object.keys(errors).length > 0)}
                className="w-full"
                animate={true}
                glow={!loading}
                icon={LockClosedIcon}
                iconPosition="left"
              >
                {loading ? t('common.loading') || 'Signing in...' : t('auth.login') || 'Sign In'}
              </Button>
            </motion.div>

            {/* Social Login Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <SocialLoginButtons
                onGoogleLogin={handleGoogleLogin}
                onFacebookLogin={handleFacebookLogin}
              />
            </motion.div>
          </form>
        </Card>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount') || "Don't have an account?"}{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:underline"
            >
              {t('auth.signUp') || 'Sign up'}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
