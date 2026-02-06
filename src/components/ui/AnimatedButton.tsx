// src/components/ui/AnimatedButton.tsx

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

export type AnimatedButtonVariant = 'primary' | 'secondary' | 'icon';
export type AnimatedButtonSize = 'sm' | 'md' | 'lg';

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileTap' | 'whileHover'> {
  variant?: AnimatedButtonVariant;
  size?: AnimatedButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses = {
  primary: 'bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] text-white shadow-glow-primary',
  secondary: 'bg-white text-[#64748B] shadow-soft-out-sm border border-gray-50',
  icon: 'w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50',
};

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = 'secondary', size = 'md', fullWidth = false, children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{
          scale: 0.92,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={`
          rounded-2xl font-bold
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
