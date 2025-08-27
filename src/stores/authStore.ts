/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan state management untuk otentikasi menggunakan Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

/**
 * @interface AuthState
 * @description Mendefinisikan bentuk (shape) dari state otentikasi.
 * @property {User | null} user - Objek pengguna, atau null jika tidak terotentikasi.
 * @property {boolean} isAuthenticated - Bernilai true jika pengguna terotentikasi.
 * @property {boolean} isLoading - Bernilai true jika status otentikasi sedang dimuat.
 * @property {(user: User | null) => void} setUser - Fungsi untuk mengatur pengguna dan status otentikasi.
 * @property {(loading: boolean) => void} setLoading - Fungsi untuk mengatur status loading.
 * @property {() => void} logout - Fungsi untuk melakukan logout pengguna.
 */
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

/**
 * @constant useAuthStore
 * @description Store otentikasi yang dibuat dengan Zustand.
 * Menggunakan middleware `persist` untuk menyimpan state otentikasi ke local storage.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            /* State awal untuk pengguna adalah null. */
            user: null,
            /* State awal untuk status otentikasi adalah false. */
            isAuthenticated: false,
            /* State awal untuk loading adalah true, karena aplikasi mungkin sedang memeriksa sesi yang tersimpan. */
            isLoading: true,
            /**
             * @function setUser
             * @description Mengatur data pengguna dan memperbarui status otentikasi.
             * @param {User | null} user - Objek pengguna yang akan diatur.
             */
            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isLoading: false
            }),
            /**
             * @function setLoading
             * @description Mengatur status loading.
             * @param {boolean} loading - Status loading yang akan diatur.
             */
            setLoading: (loading) => set({ isLoading: loading }),
            /**
             * @function logout
             * @description Melakukan logout dengan menghapus data pengguna dan status otentikasi.
             */
            logout: () => set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            }),
        }),
        {
            /* Nama item yang akan disimpan di local storage. */
            name: 'auth-storage',
            /* Hanya menyimpan field `user` dan `isAuthenticated` untuk persistensi. */
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
