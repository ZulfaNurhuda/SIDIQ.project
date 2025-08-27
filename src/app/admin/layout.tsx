/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout untuk bagian admin, melindunginya dan menyediakan UI yang konsisten.
 */

'use client';

import { Header } from '@/components/layout/Header';
import HeaderBackdrop from '@/components/layout/HeaderBackdrop';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRequireRole } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @function AdminLayout
 * @description Komponen layout yang melindungi semua rute di dalam path '/admin'.
 * Menggunakan hook `useRequireRole` untuk memastikan hanya pengguna 'superadmin' dan 'admin' yang dapat mengakses halaman ini.
 * Juga merender layout aplikasi standar dengan Header, Sidebar, dan area konten utama.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element | null} Layout admin yang dirender atau null jika pengguna tidak memiliki akses.
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* Gunakan hook kustom untuk memeriksa apakah pengguna memiliki salah satu peran yang diizinkan. */
    const { hasAccess, isLoading } = useRequireRole(['superadmin', 'admin']);

    /* Tampilkan ikon loading saat pemeriksaan peran sedang berlangsung. */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /* Jika pengguna tidak memiliki akses, jangan render apa pun. Hook akan menangani pengalihan. */
    if (!hasAccess) {
        return null;
    }

    /* Jika pengguna memiliki akses, render layout admin standar. */
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
            <Header />
            <HeaderBackdrop />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}