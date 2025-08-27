/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen halaman root, yang bertindak sebagai penjaga otentikasi dan perutean.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @function Home
 * @description Halaman masuk utama untuk aplikasi.
 * Tanggung jawab utama komponen ini adalah untuk mengarahkan pengguna berdasarkan status otentikasi dan peran mereka.
 * Menampilkan ikon loading saat memeriksa status otentikasi.
 * - Jika terotentikasi dan peran adalah 'jamaah', arahkan ke '/jamaah/form'.
 * - Jika terotentikasi dan peran adalah 'admin' atau 'superadmin', arahkan ke '/dashboard'.
 * - Jika tidak terotentikasi, arahkan ke '/login'.
 * @returns {JSX.Element} Komponen ikon loading.
 */
export default function Home() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        /* Tunggu hingga status otentikasi dimuat sepenuhnya. */
        if (!isLoading) {
            if (isAuthenticated && user) {
                /* Arahkan pengguna yang terotentikasi berdasarkan peran mereka. */
                if (user.role === 'jamaah') {
                    router.push('/jamaah/form');
                } else {
                    router.push('/dashboard');
                }
            } else {
                /* Arahkan pengguna yang tidak terotentikasi ke halaman login. */
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    /* Tampilkan ikon loading saat logika pengalihan sedang diproses. */
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}