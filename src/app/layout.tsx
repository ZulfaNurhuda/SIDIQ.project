/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout root untuk seluruh aplikasi, termasuk struktur HTML dan provider.
 */

import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

/* Inisialisasi font Lexend dengan subset, weight, dan opsi lainnya yang ditentukan. */
const lexend = Lexend({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-lexend', /* Variabel CSS untuk font */
    display: 'swap',
    preload: true,
});

/**
 * @constant metadata
 * @description Metadata untuk aplikasi, digunakan untuk SEO dan informasi browser.
 */
export const metadata: Metadata = {
    title: "SIDIQ - Sistem Informasi Pengelolaan Data Infaq",
    description: "SIDIQ (Sistem Informasi Pengelolaan Data Infaq) - Kelompok 3 - Jatiluhur - Sistem pengelolaan iuran anggota jamaah",
};

/**
 * @function RootLayout
 * @description Komponen layout root untuk aplikasi Next.js.
 * Membungkus semua halaman dengan struktur HTML, kelas font, dan provider konteks yang diperlukan.
 * @param {Readonly<{ children: React.ReactNode }>} props - Properti untuk komponen.
 * @returns {JSX.Element} Layout root yang dirender.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        /* `suppressHydrationWarning` digunakan di sini karena pergantian tema dari next-themes dapat menyebabkan ketidakcocokan antara render server dan klien. */
        <html lang="id" suppressHydrationWarning>
            <body className={`font-lexend antialiased ${lexend.variable}`} suppressHydrationWarning>
                {/* Komponen Providers membungkus children dengan semua provider konteks yang diperlukan (misalnya, ThemeProvider, QueryClientProvider). */}
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}