/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen halaman login.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/forms/LoginForm';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @function LoginPage
 * @description Komponen untuk halaman login pengguna.
 * Menampilkan `LoginForm` dan menangani pengalihan untuk pengguna yang sudah terotentikasi.
 * Jika pengguna sudah login, mereka akan dialihkan ke dashboard.
 * @returns {JSX.Element | null} Halaman login yang dirender atau null jika pengguna sudah terotentikasi.
 */
export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    /* Efek untuk mengalihkan pengguna yang terotentikasi dari halaman login. */
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    /* Tampilkan ikon loading saat status otentikasi sedang diperiksa. */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /* Render null jika pengguna terotentikasi, karena pengalihan sedang berlangsung. */
    if (isAuthenticated) {
        return null;
    }

    /* Render halaman login untuk pengguna yang tidak terotentikasi. */
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            {/* Tempatkan tombol pengalih tema di kanan atas halaman. */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md p-8">
                <LoginForm />
            </Card>
        </div>
    );
}
