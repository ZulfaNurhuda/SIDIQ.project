/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Providers, yang membungkus aplikasi dengan provider konteks yang diperlukan.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

/**
 * @function Providers
 * @description Komponen sisi klien yang membungkus children-nya dengan provider konteks esensial.
 * Ini termasuk `QueryClientProvider` untuk pengambilan dan caching data dengan TanStack Query,
 * dan `ThemeProvider` untuk mengelola tema terang/gelap/sistem dengan next-themes.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element} Provider yang dirender membungkus komponen children.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    /* Buat instance QueryClient baru. Menggunakan useState memastikan bahwa klien hanya dibuat sekali per siklus hidup komponen. */
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // Atur waktu basi default 5 menit untuk semua query.
                retry: 1, // Coba lagi query yang gagal sekali secara default.
            },
        },
    }));

    return (
        /* Menyediakan QueryClient ke semua komponen anak. */
        <QueryClientProvider client={queryClient}>
            {/* Mengelola tema warna aplikasi. */}
            <ThemeProvider
                attribute="class" /* Terapkan tema dengan menambahkan kelas ke elemen <html>. */
                defaultTheme="system" /* Default ke preferensi sistem pengguna. */
                enableSystem={true} /* Izinkan tema 'sistem'. */
                storageKey="theme" /* Kunci yang digunakan untuk menyimpan tema di local storage. */
                disableTransitionOnChange={false} /* Izinkan transisi CSS saat tema berubah. */
                themes={['light', 'dark', 'system']} /* Secara eksplisit daftar tema yang tersedia. */
            >
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}