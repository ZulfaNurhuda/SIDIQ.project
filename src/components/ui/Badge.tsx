import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border-primary-300/50',
    secondary: 'bg-gray-500/20 text-gray-900 dark:text-gray-100 border-gray-300/50',
    success: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-300/50',
    warning: 'bg-yellow-500/20 text-yellow-900 dark:text-yellow-100 border-yellow-300/50',
    error: 'bg-red-500/20 text-red-900 dark:text-red-100 border-red-300/50',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };