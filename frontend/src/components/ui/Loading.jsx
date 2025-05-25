import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Beautiful loading components with various animations
 */

// Spinner Loading
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white',
  };

  return (
    <div
      className={cn(
        'loading-spinner',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// Dots Loading
export const LoadingDots = ({ 
  size = 'md', 
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    white: 'bg-white',
  };

  return (
    <div className={cn('loading-dots', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full',
            sizeClasses[size],
            colorClasses[color]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loading
export const LoadingPulse = ({ 
  className,
  children 
}) => {
  return (
    <div className={cn('loading-pulse rounded-lg', className)}>
      {children}
    </div>
  );
};

// Skeleton Loading
export const LoadingSkeleton = ({ 
  lines = 3,
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'loading-pulse h-4 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Card Skeleton
export const LoadingCardSkeleton = ({ className }) => {
  return (
    <div className={cn('card space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <div className="loading-pulse w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="loading-pulse h-4 w-3/4 rounded" />
          <div className="loading-pulse h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="loading-pulse h-3 w-full rounded" />
        <div className="loading-pulse h-3 w-5/6 rounded" />
        <div className="loading-pulse h-3 w-4/6 rounded" />
      </div>
    </div>
  );
};

// Full Page Loading
export const LoadingPage = ({ 
  message = 'Loading...',
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        {showLogo && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600" />
          </motion.div>
        )}
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            360° Proctor
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <LoadingDots size="md" color="primary" />
      </motion.div>
    </div>
  );
};

// Overlay Loading
export const LoadingOverlay = ({ 
  show = false,
  message = 'Loading...',
  className 
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center space-y-4"
      >
        <LoadingSpinner size="lg" color="primary" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

// Button Loading
export const LoadingButton = ({ 
  loading = false,
  children,
  className,
  ...props 
}) => {
  return (
    <button
      className={cn(
        'btn btn-primary relative',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      {children}
    </button>
  );
};

export default {
  Spinner: LoadingSpinner,
  Dots: LoadingDots,
  Pulse: LoadingPulse,
  Skeleton: LoadingSkeleton,
  CardSkeleton: LoadingCardSkeleton,
  Page: LoadingPage,
  Overlay: LoadingOverlay,
  Button: LoadingButton,
};
