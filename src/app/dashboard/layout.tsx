/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout untuk bagian dashboard, melindunginya dan menyediakan UI yang konsisten.
 */

'use client';

import { Header } from '@/components/layout/Header';
import HeaderBackdrop from '@/components/layout/HeaderBackdrop';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRequireAuth } from '@/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/FullPageLoading';

/**
 * @function DashboardLayout
 * @description Komponen layout yang melindungi semua rute di dalam path '/dashboard'.
 * Menggunakan hook `useRequireAuth` untuk memastikan hanya pengguna yang terotentikasi yang dapat mengakses halaman ini.
 * Juga merender layout aplikasi standar dengan Header, Sidebar, dan area konten utama.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element | null} Layout dashboard yang dirender atau null jika pengguna tidak terotentikasi.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* Gunakan hook kustom untuk memeriksa apakah pengguna terotentikasi. */
    const { isAuthenticated, isLoading } = useRequireAuth();

    /* Tampilkan loading halaman penuh saat pemeriksaan otentikasi sedang berlangsung. */
    if (isLoading) {
        return (
            <FullPageLoading 
                title="Dashboard"
                message="Memverifikasi akses"
                tip="🔐 Memastikan Anda memiliki akses ke dashboard"
            />
        );
    }

    /* Jika pengguna tidak terotentikasi, jangan render apa pun. Hook akan menangani pengalihan. */
    if (!isAuthenticated) {
        return null;
    }

    /* Jika pengguna terotentikasi, render layout dashboard standar. */
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