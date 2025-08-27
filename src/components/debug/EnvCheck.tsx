/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen EnvCheck, sebuah alat debugging untuk memverifikasi variabel lingkungan.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

/**
 * @function EnvCheck
 * @description Komponen debugging yang memeriksa keberadaan variabel lingkungan Supabase
 * yang esensial (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
 * dan menampilkan statusnya.
 * @returns {JSX.Element} Komponen pemeriksa lingkungan yang dirender.
 */
export function EnvCheck() {
    /* Baca variabel lingkungan. */
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Environment Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Indikator status untuk URL Supabase */}
                <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">
                        SUPABASE_URL: {supabaseUrl ? '✓ Configured' : '✗ Missing'}
                    </span>
                </div>
                {/* Indikator status untuk Kunci Anon Supabase */}
                <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${supabaseKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">
                        SUPABASE_ANON_KEY: {supabaseKey ? '✓ Configured' : '✗ Missing'}
                    </span>
                </div>

                {/* Tampilkan URL jika ada */}
                {supabaseUrl && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        URL: {supabaseUrl}
                    </div>
                )}

                {/* Tampilkan versi terpotong dari kunci jika ada */}
                {supabaseKey && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Key: {supabaseKey.substring(0, 20)}...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
