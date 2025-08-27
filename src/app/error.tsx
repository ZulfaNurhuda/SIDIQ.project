/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan halaman error global untuk menangani error 500 dan error lainnya.
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home, Bug } from 'lucide-react';
import Link from 'next/link';

/**
 * @interface ErrorProps
 * @description Properti untuk komponen Error yang diterima dari Next.js error boundary.
 * @property {Error & { digest?: string }} error - Object error yang terjadi.
 * @property {() => void} reset - Function untuk reset error boundary.
 */
interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * @function Error
 * @description Komponen halaman error global dengan desain glassmorphism.
 * Menangani berbagai jenis error dan menyediakan opsi recovery.
 * @param {ErrorProps} props - Properti error dan reset function.
 * @returns {JSX.Element} Halaman error yang dirender.
 */
export default function Error({ error }: ErrorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.error('Application Error:', error);
    }, [error]);

    if (!mounted) {
        return null;
    }

    const getErrorDetails = () => {
        if (error.message.includes('fetch')) {
            return {
                title: 'Kesalahan Jaringan',
                description: 'Gagal menghubungi server. Periksa koneksi internet Anda.',
                code: 'NETWORK_ERROR'
            };
        }
        
        if (error.message.includes('unauthorized') || error.message.includes('403')) {
            return {
                title: 'Akses Ditolak',
                description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
                code: 'ACCESS_DENIED'
            };
        }

        if (error.message.includes('database') || error.message.includes('sql')) {
            return {
                title: 'Kesalahan Database',
                description: 'Terjadi masalah dengan penyimpanan data. Tim teknis telah diberitahu.',
                code: 'DATABASE_ERROR'
            };
        }

        return {
            title: 'Terjadi Kesalahan',
            description: 'Maaf, aplikasi mengalami masalah yang tidak terduga.',
            code: 'INTERNAL_ERROR'
        };
    };

    const errorDetails = getErrorDetails();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="text-center shadow-2xl animate-fade-in">
                    <CardHeader className="space-y-4">
                        {/* Error Icon */}
                        <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Error Title */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 animate-glass-shine">
                                Oops!
                            </h1>
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                                {errorDetails.title}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-300 text-body leading-relaxed">
                            {errorDetails.description}
                        </p>

                        {/* Action Button */}
                        <div>
                            <Link href="/">
                                <Button className="w-full" size="lg">
                                    <Home className="w-4 h-4 mr-2" />
                                    Kembali ke Beranda
                                </Button>
                            </Link>
                        </div>

                        {/* Error Details */}
                        <div className="pt-4 border-t border-gray-200/50 dark:border-white/10 space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Error Code: {errorDetails.code}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {error.digest}
                                </p>
                            )}
                            {process.env.NODE_ENV === 'development' && (
                                <details className="text-xs text-gray-500 dark:text-gray-400 text-left">
                                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                                        <Bug className="w-3 h-3" />
                                        Detail Error (Development)
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                                        {error.stack || error.message}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Help */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Jika masalah terus berlanjut, silakan{' '}
                        <Link 
                            href="/settings" 
                            className="text-red-600 dark:text-red-400 hover:underline font-medium"
                        >
                            hubungi administrator
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}