import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'glass-button',
      secondary: 'bg-gray-500/20 hover:bg-gray-500/30 backdrop-blur-sm border border-gray-400/60 dark:border-gray-300/50 text-gray-900 dark:text-gray-100',
      outline: 'bg-transparent hover:bg-primary-500/10 border border-primary-600/70 dark:border-primary-500/50 text-primary-900 dark:text-primary-100',
      ghost: 'bg-transparent hover:bg-primary-500/10 text-primary-900 dark:text-primary-100',
      destructive: 'bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/60 dark:border-red-300/50 text-red-900 dark:text-red-100',
      warning: 'bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-sm border border-amber-400/60 dark:border-amber-300/50 text-amber-900 dark:text-amber-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };