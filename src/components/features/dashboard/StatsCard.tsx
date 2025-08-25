import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  format?: 'currency' | 'number';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  format = 'number' 
}: StatsCardProps) {
  const formattedValue = format === 'currency' && typeof value === 'number' 
    ? formatCurrency(value) 
    : value.toString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formattedValue}
        </div>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}