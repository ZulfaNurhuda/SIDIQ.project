/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan satu set komponen majemuk untuk membuat elemen UI berbasis kartu.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * @interface CardProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @description Mendefinisikan properti dasar untuk komponen Card.
 * @property {React.ReactNode} [children] - Konten yang akan dirender di dalam komponen.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

/**
 * @function Card
 * @description Kontainer utama untuk komponen kartu. Menerapkan gaya glassmorphism.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('glass-card', className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

/**
 * @function CardHeader
 * @description Bagian header dari sebuah kartu.
 */
const CardHeader = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

/**
 * @function CardTitle
 * @description Elemen judul untuk header kartu.
 */
const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

/**
 * @function CardDescription
 * @description Elemen deskripsi atau subjudul untuk header kartu.
 */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-body-small text-gray-600 dark:text-gray-300', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';

/**
 * @function CardContent
 * @description Area konten utama dari sebuah kartu.
 */
const CardContent = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

/**
 * @function CardFooter
 * @description Bagian footer dari sebuah kartu, biasanya digunakan untuk tombol aksi.
 */
const CardFooter = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center p-6 pt-0', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
