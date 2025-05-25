import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Beautiful, modern card component with variants and animations
 */

const cardVariants = cva(
  'card',
  {
    variants: {
      variant: {
        default: '',
        glass: 'card-glass',
        gradient: 'card-gradient',
        success: 'card-success',
        warning: 'card-warning',
        error: 'card-error',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      shadow: {
        none: 'shadow-none',
        soft: 'shadow-soft',
        medium: 'shadow-medium',
        large: 'shadow-large',
        colored: 'shadow-colored',
      },
      hover: {
        none: '',
        lift: 'hover-lift',
        scale: 'hover-scale',
        glow: 'hover:glow',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shadow: 'soft',
      hover: 'lift',
    },
  }
);

const Card = forwardRef(({
  className,
  variant,
  size,
  shadow,
  hover,
  children,
  animate = true,
  delay = 0,
  ...props
}, ref) => {
  const cardClasses = cn(
    cardVariants({ variant, size, shadow, hover }),
    className
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          delay,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components
const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-4 pb-4 border-b border-gray-200 dark:border-gray-700', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

// Export all components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

export default Card;
