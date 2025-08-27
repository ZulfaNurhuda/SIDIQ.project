/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen PageTitle, sebuah header dengan gaya untuk halaman.
 */

import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * @interface PageTitleProps
 * @description Mendefinisikan properti untuk komponen PageTitle.
 * @property {string} title - Teks judul utama.
 * @property {string} [description] - Deskripsi singkat atau subjudul yang ditampilkan di bawah judul.
 * @property {LucideIcon} [icon] - Ikon opsional untuk ditampilkan di sebelah judul.
 * @property {string} [className] - Kelas CSS tambahan untuk diterapkan pada kontainer kartu.
 * @property {boolean} [gradient=true] - Apakah akan menerapkan latar belakang gradien dan elemen dekoratif.
 */
interface PageTitleProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
    gradient?: boolean;
}

/**
 * @function PageTitle
 * @description Komponen yang merender judul halaman yang khas secara visual, sering digunakan di bagian atas halaman.
 * Termasuk judul, deskripsi dan ikon opsional, serta efek gradien dekoratif.
 * @param {PageTitleProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen judul halaman yang telah dirender.
 */
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
            /* Terapkan gaya gradien secara kondisional. */
            gradient && 'bg-gradient-to-br from-blue-500/10 via-primary-400/20 to-blue-600/15 dark:from-primary-950/40 dark:to-primary-900/30',
            className
        )}>
            <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                    {/* Render ikon jika disediakan. */}
                    {Icon && (
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-primary-500 dark:to-primary-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 dark:shadow-primary-500/25">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    )}
                    <div className="flex-1">
                        {/* Judul utama dengan teks gradien. */}
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent dark:text-white mb-1">
                            {title}
                        </h1>
                        {/* Teks deskripsi. */}
                        {description && (
                            <p className="text-base text-blue-600/80 dark:text-gray-300 leading-relaxed font-medium">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Elemen dekoratif bentuk gradien untuk sentuhan visual. */}
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
