'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type TestResult = {
  type: 'success' | 'error' | 'insert-test';
  message: string;
  [key: string]: unknown;
};

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Test basic connection
      const { data } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      setTestResult({
        type: 'success',
        message: 'Database connection OK',
        data: data,
        userCount: data?.length || 0
      });
    } catch (error: unknown) {
      setTestResult({
        type: 'error',
        message: 'Database connection failed',
        error
      });
    }
    
    setIsLoading(false);
  };

  const testIuranInsert = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // First check if table exists
      const { error: tableError } = await supabase
        .from('iuran_submissions')
        .select('count', { count: 'exact', head: true });

      if (tableError) {
        setTestResult({
          type: 'error',
          message: 'Table iuran_submissions does not exist',
          error: tableError
        });
        setIsLoading(false);
        return;
      }

      // Test iuran_submissions insert with a real user_id from users table
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();

      const testData = {
        user_id: userData?.id || '550e8400-e29b-41d4-a716-446655440000',
        nama_jamaah: 'Test User',
        bulan_tahun: new Date().toISOString().slice(0, 10),
        iuran_1: 100000,
        iuran_2: 0,
        iuran_3: 0,
        iuran_4: 0,
        iuran_5: 0
      };

      const { data, error } = await supabase
        .from('iuran_submissions')
        .insert([testData])
        .select();

      setTestResult({
        type: 'insert-test',
        message: 'Iuran insert test',
        tableExists: true,
        availableUserId: userData?.id,
        testData,
        data: data,
        error: error
      });
    } catch (error: unknown) {
      setTestResult({
        type: 'error',
        message: 'Iuran insert test failed',
        error
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Database Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button 
            onClick={testConnection} 
            isLoading={isLoading}
            size="sm"
          >
            Test Connection
          </Button>
          <Button 
            onClick={testIuranInsert} 
            isLoading={isLoading}
            size="sm"
            variant="secondary"
          >
            Test Iuran Insert
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
          }`}>
            <h4 className="font-semibold mb-2">{testResult.message}</h4>
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
