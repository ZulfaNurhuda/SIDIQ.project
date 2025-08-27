/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Badge, elemen UI untuk menampilkan status atau label.
 */

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * @interface BadgeProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @description Mendefinisikan properti untuk komponen Badge.
 * @property {'default' | 'secondary' | 'success' | 'warning' | 'error'} [variant='default'] - Gaya visual dari badge.
 */
export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
}

/**
 * @function Badge
 * @description Komponen React yang merender sebuah badge dengan varian warna yang berbeda.
 * @param {BadgeProps} props - Properti untuk komponen.
 * @param {string} [props.className] - Kelas CSS tambahan yang akan diterapkan.
 * @param {BadgeProps['variant']} [props.variant='default'] - Varian dari badge.
 * @returns {JSX.Element} Komponen badge yang telah dirender.
 */
function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    /* Mendefinisikan kelas-kelas Tailwind CSS untuk setiap varian badge. */
    const variants = {
        default: 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border-primary-300/50',
        secondary: 'bg-gray-500/20 text-gray-900 dark:text-gray-100 border-gray-300/50',
        success: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-300/50',
        warning: 'bg-yellow-500/20 text-yellow-900 dark:text-yellow-100 border-yellow-300/50',
        error: 'bg-red-500/20 text-red-900 dark:text-red-100 border-red-300/50',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm border transition-colors',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
