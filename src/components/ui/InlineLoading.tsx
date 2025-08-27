/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description Komponen loading inline untuk operasi yang tidak memerlukan full page loading.
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @interface InlineLoadingProps
 * @description Properti untuk komponen InlineLoading.
 * @property {string} [message] - Pesan yang ditampilkan saat loading.
 * @property {'sm' | 'md' | 'lg'} [size] - Ukuran loading.
 * @property {boolean} [showProgress] - Apakah menampilkan progress bar.
 */
interface InlineLoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
}

/**
 * @function InlineLoading
 * @description Komponen loading inline dengan desain glassmorphism.
 * @param {InlineLoadingProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen loading inline yang dirender.
 */
export function InlineLoading({ 
    message = "Memuat", 
    size = "md",
    showProgress = true 
}: InlineLoadingProps) {
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

    const containerSizes = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={`glass-card ${containerSizes[size]} text-center space-y-4`}>
            {/* Loading Spinner */}
            <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner size={size} />
                <p className={`${textSizes[size]} font-medium text-gray-700 dark:text-gray-200 min-w-[100px]`}>
                    {loadingText}
                </p>
            </div>

            {/* Progress Bar */}
            {showProgress && (
                <div className="w-full max-w-xs mx-auto">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse w-2/3 transition-all duration-1000 ease-in-out"></div>
                    </div>
                </div>
            )}
        </div>
    );
}