/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Button, elemen interaktif standar.
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * @interface ButtonProps
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 * @description Mendefinisikan properti untuk komponen Button.
 * @property {'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'warning'} [variant='default'] - Gaya visual dari tombol.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Ukuran tombol.
 * @property {boolean} [isLoading=false] - Jika true, tombol akan dinonaktifkan dan menampilkan ikon loading.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

/**
 * @function Button
 * @description Komponen React dengan forward-ref yang merender tombol dengan berbagai gaya dan status.
 * Dapat menampilkan status loading dan tersedia dalam beberapa varian visual dan ukuran.
 * @param {ButtonProps} props - Properti untuk komponen.
 * @param {React.Ref<HTMLButtonElement>} ref - Ref yang akan diteruskan ke elemen tombol.
 * @returns {JSX.Element} Komponen tombol yang telah dirender.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        /* Gaya dasar untuk semua varian tombol. */
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        /* Kelas-kelas Tailwind CSS untuk setiap varian tombol. */
        const variants = {
            default: 'glass-button',
            secondary: 'bg-gray-500/20 hover:bg-gray-500/30 backdrop-blur-sm border border-gray-400/60 dark:border-gray-300/50 text-gray-900 dark:text-gray-100',
            outline: 'bg-transparent hover:bg-primary-500/10 border border-primary-600/70 dark:border-primary-500/50 text-primary-900 dark:text-primary-100',
            ghost: 'bg-transparent hover:bg-primary-500/10 text-primary-900 dark:text-primary-100',
            destructive: 'bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/60 dark:border-red-300/50 text-red-900 dark:text-red-100',
            warning: 'bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-sm border border-amber-400/60 dark:border-amber-300/50 text-amber-900 dark:text-amber-100',
        };

        /* Kelas-kelas Tailwind CSS untuk setiap ukuran tombol. */
        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {/* Tampilkan ikon loading jika isLoading bernilai true. */}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
