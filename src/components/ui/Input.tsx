/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Input, sebuah field input teks dengan gaya.
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * @interface InputProps
 * @extends InputHTMLAttributes<HTMLInputElement>
 * @description Mendefinisikan properti untuk komponen Input.
 * @property {string} [label] - Label yang akan ditampilkan di atas field input.
 * @property {string} [error] - Pesan error yang akan ditampilkan di bawah field input.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * @function Input
 * @description Komponen React dengan forward-ref yang merender sebuah input teks dengan gaya.
 * Termasuk dukungan opsional untuk label dan pesan error.
 * @param {InputProps} props - Properti untuk komponen.
 * @param {React.Ref<HTMLInputElement>} ref - Ref yang akan diteruskan ke elemen input.
 * @returns {JSX.Element} Komponen input yang telah dirender.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {/* Render label jika disediakan. */}
                {label && (
                    <label className="text-caption text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'glass-input font-normal text-base w-full',
                        /* Terapkan gaya error jika ada pesan error. */
                        error && 'border-red-500/50 focus:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {/* Render pesan error jika disediakan. */}
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };