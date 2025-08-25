'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function EnvCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Environment Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">
            SUPABASE_URL: {supabaseUrl ? '✓ Configured' : '✗ Missing'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${supabaseKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">
            SUPABASE_ANON_KEY: {supabaseKey ? '✓ Configured' : '✗ Missing'}
          </span>
        </div>
        
        {supabaseUrl && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            URL: {supabaseUrl}
          </div>
        )}
        
        {supabaseKey && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Key: {supabaseKey.substring(0, 20)}...
          </div>
        )}
      </CardContent>
    </Card>
  );
}