/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen DatabaseTest, sebuah alat debugging untuk menguji konektivitas database.
 */

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

/**
 * @type TestResult
 * @description Mendefinisikan bentuk objek yang digunakan untuk menyimpan hasil tes database.
 */
type TestResult = {
    type: 'success' | 'error' | 'insert-test';
    message: string;
    [key: string]: unknown;
};

/**
 * @function DatabaseTest
 * @description Komponen debugging yang menyediakan tombol untuk menguji koneksi database Supabase
 * dan operasi penyisipan sampel. Menampilkan hasil dari tes-tes ini.
 * @returns {JSX.Element} Komponen tes database yang dirender.
 */
export function DatabaseTest() {
    /* State untuk menyimpan hasil tes database terakhir. */
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    /* State untuk mengelola status loading saat tes berjalan. */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @function testConnection
     * @description Menguji koneksi baca dasar ke tabel 'users'.
     */
    const testConnection = async () => {
        setIsLoading(true);
        setTestResult(null);

        try {
            const { data } = await supabase.from('users').select('*').limit(1);
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

    /**
     * @function testIuranInsert
     * @description Menguji operasi penyisipan ke tabel 'iuran_submissions'.
     * Pertama-tama mencoba mengambil ID pengguna nyata untuk digunakan dalam data tes.
     */
    const testIuranInsert = async () => {
        setIsLoading(true);
        setTestResult(null);

        try {
            /* Pertama, periksa apakah tabel target ada. */
            const { error: tableError } = await supabase.from('iuran_submissions').select('count', { count: 'exact', head: true });
            if (tableError) {
                setTestResult({ type: 'error', message: 'Table iuran_submissions does not exist', error: tableError });
                setIsLoading(false);
                return;
            }

            /* Ambil pengguna untuk mendapatkan user_id yang valid untuk constraint foreign key. */
            const { data: userData } = await supabase.from('users').select('id').limit(1).single();
            const testData = {
                user_id: userData?.id || '550e8400-e29b-41d4-a716-446655440000', // Fallback UUID
                nama_jamaah: 'Test User',
                bulan_tahun: new Date().toISOString().slice(0, 10),
                iuran_1: 100000,
                iuran_2: 0,
                iuran_3: 0,
                iuran_4: 0,
                iuran_5: 0
            };

            /* Coba sisipkan data tes. */
            const { data, error } = await supabase.from('iuran_submissions').insert([testData]).select();
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
                    <Button onClick={testConnection} isLoading={isLoading} size="sm">Test Connection</Button>
                    <Button onClick={testIuranInsert} isLoading={isLoading} size="sm" variant="secondary">Test Iuran Insert</Button>
                </div>

                {/* Tampilkan hasil tes dalam format JSON. */}
                {testResult && (
                    <div className={`p-4 rounded-lg ${testResult.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
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