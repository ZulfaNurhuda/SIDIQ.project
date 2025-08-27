/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen HeaderBackdrop, sebuah elemen dekoratif untuk area header.
 */

'use client';

/**
 * @interface HeaderBackdropProps
 * @description Mendefinisikan properti untuk komponen HeaderBackdrop.
 * @property {string} [heightClass='h-28'] - Kelas tinggi Tailwind CSS (misalnya, 'h-24') untuk mengontrol tinggi backdrop.
 * @property {string} [className] - Kelas CSS tambahan untuk diterapkan pada elemen backdrop.
 */
interface HeaderBackdropProps {
    heightClass?: string;
    className?: string;
}

/**
 * @function HeaderBackdrop
 * @description Komponen sederhana yang merender backdrop gradien dengan posisi tetap.
 * Biasanya ditempatkan di belakang header utama untuk menciptakan efek visual.
 * @param {HeaderBackdropProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Elemen backdrop yang telah dirender.
 */
export function HeaderBackdrop({ heightClass = 'h-28', className = '' }: HeaderBackdropProps) {
    return (
        <div
            className={[
                'fixed top-0 left-0 right-0 z-30 pointer-events-none',
                'bg-gradient-to-b from-primary-50 to-white/0 dark:from-gray-900 dark:to-gray-900/0',
                heightClass,
                className,
            ].join(' ')}
        />
    );
}

export default HeaderBackdrop;