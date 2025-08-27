/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini berisi custom hooks untuk otentikasi dan otorisasi.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';

/**
 * @function getErrorMessage
 * @description Mengekstrak pesan error dalam bentuk string dari tipe error yang tidak diketahui.
 * @param {unknown} err - Objek error.
 * @returns {string | undefined} String pesan error, atau undefined jika tidak ditemukan.
 */
function getErrorMessage(err: unknown): string | undefined {
    if (err && typeof err === 'object' && 'message' in err) {
        const msg = (err as { message?: unknown }).message;
        return typeof msg === 'string' ? msg : undefined;
    }
    return undefined;
}

/**
 * @hook useAuth
 * @description Hook komprehensif untuk mengelola state dan aksi otentikasi pengguna.
 * Terintegrasi dengan `useAuthStore` (Zustand) untuk manajemen state.
 * @returns {object} Objek yang berisi data pengguna, status otentikasi, status loading, dan fungsi-fungsi otentikasi.
 */
export function useAuth() {
    const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        /* Saat pertama kali dimuat, atur loading ke false karena store sudah di-rehydrate. */
        setLoading(false);
    }, [setLoading]);

    /**
     * @function login
     * @description Menangani proses login pengguna.
     * Memanggil fungsi RPC Supabase untuk mengotentikasi pengguna.
     * @param {string} username - Username pengguna.
     * @param {string} password - Password pengguna.
     * @returns {Promise<{success: boolean, error?: string}>} Objek yang menandakan keberhasilan atau kegagalan.
     */
    const login = async (username: string, password: string) => {
        try {
            setLoading(true);

            /* Pertama, periksa apakah username ada dan aktif. */
            const { data: userCheck, error: userCheckError } = await supabase
                .from('users')
                .select('id, username, is_active')
                .eq('username', username)
                .maybeSingle();

            if (userCheckError) {
                throw new Error(`Database error: ${userCheckError.message}`);
            }

            /* Jika pengguna tidak ada, lempar error spesifik. */
            if (!userCheck) {
                throw new Error('USER_NOT_FOUND');
            }

            /* Jika pengguna tidak aktif, lempar error spesifik. */
            if (!userCheck.is_active) {
                throw new Error('USER_INACTIVE');
            }

            /* Jika pengguna ada dan aktif, coba otentikasi dengan password. */
            const { data, error } = await supabase.rpc('authenticate_user', {
                input_username: username,
                input_password: password
            });

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            /* Jika otentikasi berhasil, RPC akan mengembalikan data pengguna. */
            if (data && data.length > 0) {
                const userData = data[0];
                const user: User = {
                    id: userData.user_id,
                    username: userData.username,
                    full_name: userData.full_name,
                    role: userData.role,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                /* Atur pengguna di store global. */
                setUser(user);
                return { success: true };
            } else {
                /* Jika RPC tidak mengembalikan data, berarti password salah. */
                throw new Error('WRONG_PASSWORD');
            }
        } catch (error: unknown) {
            /* Tangani berbagai jenis error dan kembalikan pesan yang ramah pengguna. */
            let errorMessage = 'Terjadi kesalahan sistem';
            const msg = getErrorMessage(error) || '';

            if (msg === 'USER_NOT_FOUND') {
                errorMessage = '❌ Username tidak ditemukan. Periksa kembali username Anda.';
            } else if (msg === 'USER_INACTIVE') {
                errorMessage = '🚫 Akun Anda tidak aktif. Hubungi administrator untuk mengaktifkan akun.';
            } else if (msg === 'WRONG_PASSWORD') {
                errorMessage = '🔒 Password salah. Periksa kembali password Anda.';
            } else if (typeof msg === 'string' && msg.includes('Database error')) {
                errorMessage = '🔧 Koneksi database gagal. Periksa konfigurasi Supabase.';
            } else if (typeof msg === 'string' && msg.includes('Failed to fetch')) {
                errorMessage = '🌐 Tidak dapat terhubung ke server. Periksa URL Supabase.';
            } else {
                errorMessage = '⚠️ Terjadi kesalahan sistem. Silakan coba lagi.';
            }

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * @function signOut
     * @description Menangani proses sign-out pengguna.
     * Menghapus sesi pengguna dari database dan state lokal.
     */
    const signOut = async () => {
        try {
            /* Hapus sesi pengguna saat ini di database untuk tujuan audit. */
            await supabase.rpc('set_config', {
                setting_name: 'app.current_user_id',
                new_value: '00000000-0000-0000-0000-000000000000',
                is_local: true
            });

            /* Lakukan logout dari store sisi klien dan alihkan halaman. */
            logout();
            router.push('/login');
        } catch {
            /* Pastikan logout terjadi bahkan jika panggilan RPC gagal. */
            logout();
            router.push('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout: signOut,
        setUser,
    };
}

/**
 * @hook useRequireAuth
 * @description Hook untuk melindungi rute yang memerlukan otentikasi.
 * Mengalihkan pengguna yang tidak terotentikasi ke halaman yang ditentukan.
 * @param {string} [redirectTo='/login'] - Path untuk pengalihan jika pengguna tidak terotentikasi.
 * @returns {{isAuthenticated: boolean, isLoading: boolean}} Status otentikasi dan loading.
 */
export function useRequireAuth(redirectTo: string = '/login') {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        /* Jika loading selesai dan pengguna tidak terotentikasi, alihkan. */
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, redirectTo, router]);

    return { isAuthenticated, isLoading };
}

/**
 * @hook useRequireRole
 * @description Hook untuk melindungi rute berdasarkan peran pengguna.
 * Mengalihkan pengguna yang tidak memiliki peran yang diperlukan.
 * @param {string[]} allowedRoles - Array peran yang diizinkan untuk mengakses rute.
 * @param {string} [redirectTo='/'] - Path untuk pengalihan jika peran pengguna tidak diizinkan.
 * @returns {{hasAccess: boolean, isLoading: boolean}} Objek yang menunjukkan jika pengguna memiliki akses dan status loading.
 */
export function useRequireRole(allowedRoles: string[], redirectTo: string = '/') {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        /* Jika loading selesai, pengguna ada, tetapi perannya tidak ada dalam daftar yang diizinkan, alihkan. */
        if (!isLoading && user && !allowedRoles.includes(user.role)) {
            router.push(redirectTo);
        }
    }, [user, isLoading, allowedRoles, redirectTo, router]);

    return { hasAccess: user && allowedRoles.includes(user.role), isLoading };
}