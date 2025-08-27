/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan halaman 404 kustom dengan desain glassmorphism yang konsisten dengan tema aplikasi.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Home, FileQuestion } from 'lucide-react';

/**
 * @function NotFound
 * @description Komponen halaman 404 dengan desain glassmorphism dan animasi interaktif.
 * Menampilkan pesan error yang user-friendly dan opsi navigasi.
 * @returns {JSX.Element} Halaman 404 yang dirender dengan gaya konsisten.
 */
export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="text-center shadow-2xl animate-fade-in">
                    <CardHeader className="space-y-4">
                        {/* Error Icon */}
                        <div className="mx-auto w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <FileQuestion className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                        </div>

                        {/* Error Code */}
                        <div className="space-y-2">
                            <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 animate-glass-shine">
                                404
                            </h1>
                            <CardTitle className="text-2xl text-gray-900 dark:text-white">
                                Halaman Tidak Ditemukan
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-300 text-body leading-relaxed">
                            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                            Mungkin halaman telah dipindahkan atau URL salah.
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
                        <div className="pt-4 border-t border-gray-200/50 dark:border-white/10">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Error Code: HTTP 404 - Page Not Found
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Jika masalah terus berlanjut, silakan{' '}
                        <Link 
                            href="/settings" 
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            hubungi administrator
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}