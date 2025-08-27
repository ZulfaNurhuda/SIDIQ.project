/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout untuk bagian jamaah, melindunginya dan menyediakan UI yang konsisten.
 */

'use client';

import { Header } from '@/components/layout/Header';
import HeaderBackdrop from '@/components/layout/HeaderBackdrop';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRequireRole } from '@/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/FullPageLoading';

/**
 * @function JamaahLayout
 * @description Komponen layout yang melindungi semua rute di dalam path '/jamaah'.
 * Menggunakan hook `useRequireRole` untuk memastikan hanya pengguna 'jamaah', 'admin', dan 'superadmin' yang dapat mengakses halaman ini.
 * Juga merender layout aplikasi standar dengan Header, Sidebar, dan area konten utama.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element | null} Layout jamaah yang dirender atau null jika pengguna tidak memiliki akses.
 */
export default function JamaahLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* Izinkan jamaah, admin, dan superadmin untuk mengakses halaman jamaah. */
    const { hasAccess, isLoading } = useRequireRole(['jamaah', 'admin', 'superadmin']);

    /* Tampilkan loading halaman penuh saat pemeriksaan peran sedang berlangsung. */
    if (isLoading) {
        return (
            <FullPageLoading 
                title="Area Jamaah"
                message="Memverifikasi akses"
                tip="🕋 Selamat datang di area jamaah"
            />
        );
    }

    /* Jika pengguna tidak memiliki akses, jangan render apa pun. Hook akan menangani pengalihan. */
    if (!hasAccess) {
        return null;
    }

    /* Jika pengguna memiliki akses, render layout jamaah standar. */
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