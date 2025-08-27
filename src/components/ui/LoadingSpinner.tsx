/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen LoadingSpinner, sebuah indikator visual untuk status loading.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @interface LoadingSpinnerProps
 * @description Mendefinisikan properti untuk komponen LoadingSpinner.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Ukuran spinner.
 * @property {string} [className] - Kelas CSS tambahan yang akan diterapkan pada ikon spinner.
 */
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * @function LoadingSpinner
 * @description Komponen React yang menampilkan ikon loader yang berputar.
 * Dapat disesuaikan dengan ukuran yang berbeda.
 * @param {LoadingSpinnerProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen loading spinner yang telah dirender.
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    /* Mendefinisikan kelas-kelas ukuran Tailwind CSS untuk spinner. */
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className="flex items-center justify-center">
            <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
        </div>
    );
}
