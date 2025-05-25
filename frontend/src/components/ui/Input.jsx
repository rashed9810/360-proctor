import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Beautiful, modern input component with variants and animations
 */

const inputVariants = cva(
  'input focus-ring',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-gray-50 dark:bg-gray-800 border-transparent',
        outlined: 'bg-transparent border-2',
        underlined: 'bg-transparent border-0 border-b-2 rounded-none px-0',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
      state: {
        default: '',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
        warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

const Input = forwardRef(({
  className,
  variant,
  size,
  state,
  type = 'text',
  label,
  placeholder,
  error,
  success,
  helper,
  icon: Icon,
  iconPosition = 'left',
  animate = true,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  // Determine state based on props
  let currentState = state;
  if (error) currentState = 'error';
  else if (success) currentState = 'success';

  const inputClasses = cn(
    inputVariants({ variant, size, state: currentState }),
    {
      'pl-10': Icon && iconPosition === 'left',
      'pr-10': Icon && iconPosition === 'right',
      'pr-10': isPassword && showPasswordToggle,
    },
    className
  );

  const inputElement = (
    <div className="relative">
      {/* Left Icon */}
      {Icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={cn(
            'h-5 w-5',
            currentState === 'error' ? 'text-red-500' :
            currentState === 'success' ? 'text-green-500' :
            currentState === 'warning' ? 'text-yellow-500' :
            isFocused ? 'text-blue-500' : 'text-gray-400'
          )} />
        </div>
      )}

      {/* Input Field */}
      <input
        ref={ref}
        type={inputType}
        className={inputClasses}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Right Icon */}
      {Icon && iconPosition === 'right' && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Icon className={cn(
            'h-5 w-5',
            currentState === 'error' ? 'text-red-500' :
            currentState === 'success' ? 'text-green-500' :
            currentState === 'warning' ? 'text-yellow-500' :
            isFocused ? 'text-blue-500' : 'text-gray-400'
          )} />
        </div>
      )}

      {/* Password Toggle */}
      {isPassword && showPasswordToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
  );

  const content = (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className={cn(
          'block text-sm font-medium transition-colors duration-200',
          currentState === 'error' ? 'text-red-700 dark:text-red-400' :
          currentState === 'success' ? 'text-green-700 dark:text-green-400' :
          currentState === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
          'text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}

      {/* Input */}
      {inputElement}

      {/* Helper Text / Error Message */}
      {(error || success || helper) && (
        <p className={cn(
          'text-sm transition-colors duration-200',
          error ? 'text-red-600 dark:text-red-400' :
          success ? 'text-green-600 dark:text-green-400' :
          'text-gray-500 dark:text-gray-400'
        )}>
          {error || success || helper}
        </p>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
});

Input.displayName = 'Input';

export default Input;
