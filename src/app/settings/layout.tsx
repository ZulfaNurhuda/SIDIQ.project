/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout untuk bagian pengaturan, melindunginya dan menyediakan UI yang konsisten.
 */

'use client';

import { Header } from '@/components/layout/Header';
import HeaderBackdrop from '@/components/layout/HeaderBackdrop';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/FullPageLoading';

/**
 * @function SettingsLayout
 * @description Komponen layout yang melindungi semua rute di dalam path '/settings'.
 * Menggunakan hook `useAuth` untuk memastikan hanya pengguna yang terotentikasi yang dapat mengakses halaman ini.
 * Juga merender layout aplikasi standar dengan Header, Sidebar, dan area konten utama.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element | null} Layout pengaturan yang dirender atau null jika pengguna tidak terotentikasi.
 */
export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();

    /* Tampilkan loading halaman penuh saat pemeriksaan otentikasi sedang berlangsung. */
    if (isLoading) {
        return (
            <FullPageLoading 
                title="Pengaturan"
                message="Memuat pengaturan"
                tip="⚙️ Kustomisasi pengalaman Anda di sini"
            />
        );
    }

    /* Jika pengguna tidak terotentikasi, jangan render apa pun. Hook useAuth akan menangani pengalihan. */
    if (!user) {
        return null;
    }

    /* Jika pengguna terotentikasi, render layout pengaturan standar. */
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