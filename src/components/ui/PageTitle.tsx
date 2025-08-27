import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageTitleProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  gradient?: boolean;
}

export function PageTitle({ 
  title, 
  description, 
  icon: Icon, 
  className,
  gradient = true 
}: PageTitleProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-primary-300/60 dark:border-primary-800/30 mt-2 shadow-lg',
      gradient && 'bg-gradient-to-br from-blue-500/10 via-primary-400/20 to-blue-600/15 dark:from-primary-950/40 dark:to-primary-900/30',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-primary-500 dark:to-primary-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 dark:shadow-primary-500/25">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent dark:text-white mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-base text-blue-600/80 dark:text-gray-300 leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        {gradient && (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/25 to-transparent dark:from-primary-700/20 rounded-bl-full" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-blue-500/20 to-transparent dark:from-primary-600/15 rounded-full" />
          </>
        )}
      </CardContent>
    </Card>
  );
}