/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description Komponen loading halaman penuh dengan desain glassmorphism yang konsisten.
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @interface FullPageLoadingProps
 * @description Properti untuk komponen FullPageLoading.
 * @property {string} [title] - Judul yang ditampilkan saat loading.
 * @property {string} [message] - Pesan yang ditampilkan saat loading.
 * @property {string} [tip] - Tips yang ditampilkan di bagian bawah.
 */
interface FullPageLoadingProps {
    title?: string;
    message?: string;
    tip?: string;
}

/**
 * @function FullPageLoading
 * @description Komponen loading halaman penuh dengan animasi dan desain yang konsisten dengan tema aplikasi.
 * @param {FullPageLoadingProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen loading halaman penuh yang dirender.
 */
export function FullPageLoading({ 
    title = "SIDIQ", 
    message = "Memuat", 
    tip = "💡 Tip: Gunakan mode gelap untuk pengalaman yang lebih nyaman di malam hari" 
}: FullPageLoadingProps) {
    const [mounted, setMounted] = useState(false);
    const [loadingText, setLoadingText] = useState(message);

    useEffect(() => {
        setMounted(true);

        const texts = [message, `${message}.`, `${message}..`, `${message}...`];
        let index = 0;

        const interval = setInterval(() => {
            setLoadingText(texts[index % texts.length]);
            index++;
        }, 500);

        return () => clearInterval(interval);
    }, [message]);

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300/5 rounded-full blur-3xl animate-glass-shine"></div>
            </div>

            {/* Loading Content */}
            <div className="relative z-10 text-center space-y-8">
                {/* Logo/Brand Area */}
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-primary-400/30 animate-pulse">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">SI</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sistem Informasi Pengelolaan Data Infaq
                    </p>
                </div>

                {/* Loading Spinner */}
                <div className="flex flex-col items-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-200 min-w-[120px]">
                        {loadingText}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="w-64 mx-auto">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse w-3/4 transition-all duration-1000 ease-in-out"></div>
                    </div>
                </div>

                {/* Loading Tips */}
                <div className="glass-card p-4 max-w-xs mx-auto">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tip}
                    </p>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-primary-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-32 w-2 h-2 bg-primary-400/30 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-20 w-5 h-5 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
    );
}