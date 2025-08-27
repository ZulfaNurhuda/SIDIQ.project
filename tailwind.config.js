/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mengkonfigurasi Tailwind CSS untuk proyek, mendefinisikan jalur konten,
 * pengaturan mode gelap, tema kustom (warna, font), dan animasi.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    /* Konfigurasi file untuk memindai kelas Tailwind. */
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    /* Aktifkan mode gelap berdasarkan strategi 'class'. */
    darkMode: 'class',
    theme: {
        extend: {
            /* Perluas family font default dengan font kustom. */
            fontFamily: {
                sans: ['Lexend', 'system-ui', 'sans-serif'],
                lexend: ['Lexend', 'system-ui', 'sans-serif'],
            },
            /* Definisikan palet warna kustom. */
            colors: {
                primary: {
                    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
                    500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
                    950: '#172554',
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.25)',
                    dark: 'rgba(0, 0, 0, 0.25)',
                }
            },
            /* Perluas utilitas backdrop blur. */
            backdropBlur: {
                xs: '2px',
            },
            /* Definisikan animasi kustom. */
            animation: {
                'glass-shine': 'glass-shine 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            /* Definisikan keyframe kustom untuk animasi. */
            keyframes: {
                'glass-shine': {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '0.8' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    /* Tambahkan plugin Tailwind CSS. */
    plugins: [
        require('@tailwindcss/forms'), /* Plugin untuk styling elemen form. */
        require('@tailwindcss/typography'), /* Plugin untuk menambahkan default tipografi yang indah. */
    ],
};
