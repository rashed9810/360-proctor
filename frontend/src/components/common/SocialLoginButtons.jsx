import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/**
 * Enhanced Social login buttons component with beautiful animations
 * @param {Object} props - Component props
 * @param {Function} props.onGoogleLogin - Google login handler
 * @param {Function} props.onFacebookLogin - Facebook login handler
 * @param {boolean} props.loading - Loading state
 */
const SocialLoginButtons = ({ onGoogleLogin, onFacebookLogin, loading = false }) => {
  const { t } = useTranslation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await onGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    try {
      await onFacebookLogin();
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Google Login Button */}
      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading || facebookLoading}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 10px 30px rgba(66, 133, 244, 0.2)',
        }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full group overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0.5 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {/* Button glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

        {/* Button content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl px-6 py-3 flex items-center justify-center space-x-3 transition-all duration-300">
          {googleLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
            />
          ) : (
            <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
            </motion.div>
          )}

          <span className="font-semibold text-gray-700 dark:text-gray-200 text-base">
            {googleLoading
              ? t('common.loading') || 'Connecting...'
              : t('auth.continueWithGoogle') || 'Continue with Google'}
          </span>

          {!googleLoading && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="group-hover:translate-x-1 transition-transform duration-300"
            >
              →
            </motion.div>
          )}
        </div>

        {/* Shimmer effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </motion.button>

      {/* Enhanced Facebook Login Button */}
      <motion.button
        type="button"
        onClick={handleFacebookLogin}
        disabled={loading || googleLoading || facebookLoading}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 10px 30px rgba(24, 119, 242, 0.2)',
        }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full group overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0.5 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {/* Button glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

        {/* Button content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl px-6 py-3 flex items-center justify-center space-x-3 transition-all duration-300">
          {facebookLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full"
            />
          ) : (
            <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }}>
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
              </svg>
            </motion.div>
          )}

          <span className="font-semibold text-gray-700 dark:text-gray-200 text-base">
            {facebookLoading
              ? t('common.loading') || 'Connecting...'
              : t('auth.continueWithFacebook') || 'Continue with Facebook'}
          </span>

          {!facebookLoading && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="group-hover:translate-x-1 transition-transform duration-300"
            >
              →
            </motion.div>
          )}
        </div>

        {/* Shimmer effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </motion.button>
    </div>
  );
};

export default SocialLoginButtons;
