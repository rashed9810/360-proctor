import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import toast from 'react-hot-toast';
import BackgroundPattern from '../../components/common/BackgroundPattern';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import SocialLoginButtons from '../../components/common/SocialLoginButtons';

// Services
import authService from '../../api/authService';

// Enhanced animations
import '../../styles/auth-animations.css';

// New UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/Loading';

// Icons
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = t('validation.required') || 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = t('validation.required') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail') || 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = t('validation.required') || 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password =
        t('validation.passwordLength') || 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required') || 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch') || 'Passwords do not match';
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

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(t('auth.registerSuccess') || 'Registration successful!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || t('auth.registerError') || 'Registration failed';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = async () => {
    try {
      const { default: socialAuthService } = await import('../../services/socialAuthService');

      // Check if Google login is available
      const availability = socialAuthService.isAvailable();
      if (!availability.google) {
        toast.error('Google login is not configured. Please contact administrator.');
        return;
      }

      const socialData = await socialAuthService.loginWithGoogle();
      const result = await authService.socialLogin(socialData);

      if (result.success) {
        toast.success(t('auth.registerSuccess') || 'Registration successful!');
        navigate('/');
      } else {
        toast.error(result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Google registration error:', error);
      toast.error(error.message || 'Google registration failed. Please try again.');
      setErrors({ general: error.message || 'Google registration failed' });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { default: socialAuthService } = await import('../../services/socialAuthService');

      // Check if Facebook login is available
      const availability = socialAuthService.isAvailable();
      if (!availability.facebook) {
        toast.error('Facebook login is not configured. Please contact administrator.');
        return;
      }

      const socialData = await socialAuthService.loginWithFacebook();
      const result = await authService.socialLogin(socialData);

      if (result.success) {
        toast.success(t('auth.registerSuccess') || 'Registration successful!');
        navigate('/');
      } else {
        toast.error(result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Facebook registration error:', error);
      toast.error(error.message || 'Facebook registration failed. Please try again.');
      setErrors({ general: error.message || 'Facebook registration failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background with Multiple Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" />

      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating circles */}
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-xl"
        />

        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-xl"
        />

        {/* Smaller floating elements */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 right-1/3 w-20 h-20 bg-gradient-to-br from-pink-400/40 to-purple-500/40 rounded-3xl blur-sm"
        />

        <motion.div
          animate={{
            y: [0, 35, 0],
            x: [0, -25, 0],
            rotate: [0, -360],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-sm"
        />

        {/* Geometric patterns */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-purple-200/20 dark:border-purple-400/10 rounded-full"
        />

        <motion.div
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-blue-200/20 dark:border-blue-400/10 rounded-full"
        />
      </div>

      {/* Enhanced SVG Background Pattern */}
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
        className="max-w-lg w-full space-y-8 relative z-10"
      >
        {/* Enhanced Logo and Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
          className="text-center"
        >
          {/* Enhanced Logo with Multiple Layers */}
          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.6 },
            }}
            className="relative mx-auto h-24 w-24 mb-8"
          >
            {/* Outer glow ring */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full opacity-20 blur-md"
            />

            {/* Main logo container */}
            <div className="relative h-full w-full">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-600 to-blue-700 rounded-2xl shadow-2xl" />

              {/* Inner white container */}
              <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-inner">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <UserPlusIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </motion.div>
              </div>

              {/* Floating sparkles with different animations */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -right-2"
              >
                <SparklesIcon className="h-5 w-5 text-pink-400" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 6, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute -bottom-2 -left-2"
              >
                <SparklesIcon className="h-4 w-4 text-blue-400" />
              </motion.div>

              <motion.div
                animate={{
                  x: [0, 4, 0],
                  opacity: [0.4, 1, 0.4],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute -top-1 -left-3"
              >
                <SparklesIcon className="h-3 w-3 text-purple-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Title with Gradient Animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
            className="text-5xl font-bold mb-3 relative"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
              360° Proctor
            </span>
            {/* Subtle text shadow effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 bg-clip-text text-transparent blur-sm -z-10">
              360° Proctor
            </span>
          </motion.h1>

          {/* Enhanced Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-3xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight"
          >
            <span className="relative">
              {t('auth.register')}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </span>
          </motion.h2>

          {/* Enhanced Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed"
          >
            {t('auth.registerSubtitle') ||
              'Create your account to get started with secure online proctoring.'}
          </motion.p>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex justify-center mt-4 space-x-2"
          >
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Form Card with Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.8, type: 'spring', stiffness: 100 }}
          className="relative"
        >
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-60" />

          {/* Main card */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 overflow-hidden">
            {/* Card background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/20" />

            {/* Floating particles inside card */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  x: [0, 120, 0],
                  y: [0, -60, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full"
              />
              <motion.div
                animate={{
                  x: [0, -90, 0],
                  y: [0, 70, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full"
              />
            </div>

            <div className="relative z-10">
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

              {/* Enhanced Registration Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Full Name Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <Input
                      label={t('auth.name')}
                      type="text"
                      name="name"
                      placeholder={t('auth.name') || 'Enter your full name'}
                      value={formData.name}
                      onChange={handleChange}
                      icon={UserIcon}
                      error={errors.name}
                      animate={true}
                      autoComplete="name"
                      required
                    />
                  </motion.div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                  >
                    <Input
                      label={t('auth.email')}
                      type="email"
                      name="email"
                      placeholder={t('auth.email') || 'Enter your email address'}
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
                    transition={{ delay: 1.4, duration: 0.5 }}
                  >
                    <Input
                      label={t('auth.password')}
                      type="password"
                      name="password"
                      placeholder={t('auth.password') || 'Create a strong password'}
                      value={formData.password}
                      onChange={handleChange}
                      icon={LockClosedIcon}
                      error={errors.password}
                      animate={true}
                      showPasswordToggle={true}
                      autoComplete="new-password"
                      required
                    />

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2"
                      >
                        <PasswordStrengthMeter password={formData.password} />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    <Input
                      label={t('auth.confirmPassword')}
                      type="password"
                      name="confirmPassword"
                      placeholder={t('auth.confirmPassword') || 'Confirm your password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      icon={LockClosedIcon}
                      error={errors.confirmPassword}
                      animate={true}
                      showPasswordToggle={true}
                      autoComplete="new-password"
                      required
                    />
                  </motion.div>
                </div>

                {/* Enhanced Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="relative"
                >
                  <motion.button
                    type="submit"
                    disabled={loading || (formTouched && Object.keys(errors).length > 0)}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-0.5 transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                    {/* Button content */}
                    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl px-6 py-4 text-white font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>{t('common.loading') || 'Creating account...'}</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <UserPlusIcon className="h-5 w-5" />
                          </motion.div>
                          <span>{t('auth.register') || 'Create Account'}</span>
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="group-hover:translate-x-1 transition-transform duration-300"
                          >
                            →
                          </motion.div>
                        </>
                      )}
                    </div>

                    {/* Shimmer effect */}
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  </motion.button>
                </motion.div>

                {/* Enhanced Social Login Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="relative"
                >
                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300/50 dark:border-gray-600/50" />
                    </div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 px-4 text-sm text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                      {t('auth.orContinueWith') || 'Or continue with'}
                    </div>
                  </div>

                  <SocialLoginButtons
                    onGoogleLogin={handleGoogleLogin}
                    onFacebookLogin={handleFacebookLogin}
                  />
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Sign In Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/30">
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              {t('auth.hasAccount') || 'Already have an account?'}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 transition-all duration-300 group"
              >
                <span>{t('auth.signIn') || 'Sign in'}</span>
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="text-purple-600 group-hover:text-blue-600 transition-colors duration-300"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full opacity-60 animate-pulse" />
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-40 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
