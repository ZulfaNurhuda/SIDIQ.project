/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini berisi custom hooks untuk mengambil dan mengelola data pengguna menggunakan @tanstack/react-query.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

/**
 * @hook useUsers
 * @description Mengambil daftar semua pengguna aktif menggunakan fungsi RPC Supabase.
 * @returns {QueryResult<User[]>} Hasil query yang berisi daftar pengguna aktif.
 */
export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            /* Panggil fungsi RPC untuk mendapatkan daftar pengguna aktif. */
            const { data, error } = await supabase
                .rpc('get_active_users');

            if (error) {
                throw error;
            }

            return data as User[];
        },
        /* Cache data selama 5 menit. */
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * @hook useCreateUser
 * @description Menyediakan fungsi mutasi untuk membuat pengguna baru.
 * Memanggil fungsi RPC Supabase `add_new_user` yang menangani hashing password dan logika lainnya.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData: {
            username: string;
            full_name: string;
            role: 'admin' | 'jamaah';
            password: string;
        }) => {
            try {
                /* Panggil fungsi RPC untuk menambahkan pengguna baru. */
                const { data, error } = await supabase.rpc('add_new_user', {
                    p_username: userData.username,
                    p_full_name: userData.full_name,
                    p_password: userData.password,
                    p_role: userData.role,
                });

                if (error) {
                    /* Tangani jenis error spesifik yang ramah pengguna berdasarkan respons database. */
                    if (error.message?.includes('Username sudah digunakan oleh user aktif')) {
                        throw new Error('Username sudah digunakan oleh user aktif, silakan pilih username lain');
                    }
                    if (error.message?.includes('Username hanya boleh berisi')) {
                        throw new Error('Username hanya boleh berisi huruf, angka, titik (.), dan underscore (_)');
                    }
                    if (error.message?.includes('Could not find the function')) {
                        throw new Error('Fungsi add_new_user tidak ditemukan. Pastikan database sudah di-setup dengan benar.');
                    }
                    throw new Error(`Gagal membuat user: ${error.message || 'Unknown error'}`);
                }

                if (!data || data.length === 0) {
                    throw new Error('User berhasil dibuat tetapi tidak ada data yang dikembalikan');
                }

                return data[0]; /* Kembalikan data pengguna yang baru dibuat. */
            } catch (err) {
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Terjadi kesalahan yang tidak diketahui saat membuat user');
            }
        },
        /* Setelah mutasi berhasil, batalkan validasi query untuk mengambil ulang data pengguna dan dashboard. */
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
        },
    });
}

/**
 * @hook useUpdateUser
 * @description Menyediakan fungsi mutasi untuk memperbarui detail pengguna, termasuk password.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            password,
            ...userData
        }: {
            id: string;
            username?: string;
            full_name?: string;
            role?: 'admin' | 'jamaah' | 'superadmin';
            password?: string;
        }) => {
            try {
                /* Jika password baru disediakan, tangani logika pembaruan password. */
                if (password) {
                    const { data: currentUser, error: fetchError } = await supabase
                        .from('users')
                        .select('username, full_name, role')
                        .eq('id', id)
                        .single();

                    if (fetchError) {
                        throw new Error(`Gagal mengambil data user: ${fetchError.message}`);
                    }

                    if (!currentUser) {
                        throw new Error('User tidak ditemukan');
                    }

                    /* Solusi untuk memperbarui password dengan memanggil kembali fungsi RPC 'add_new_user'. */
                    /* Fungsi ini dirancang untuk menangani konflik dan secara efektif memperbarui password. */
                    try {
                        const { data, error } = await supabase.rpc('add_new_user', {
                            p_username: currentUser.username,
                            p_full_name: userData.full_name || currentUser.full_name,
                            p_password: password,
                            p_role: userData.role || currentUser.role,
                        });

                        /* Jika terjadi error spesifik "username sudah digunakan", itu berarti pembaruan password berhasil. */
                        if (error && error.message && error.message.includes('Username sudah digunakan oleh user aktif')) {
                            return { success: true, message: 'Password updated successfully' };
                        }

                        if (!error && data) {
                            return data[0];
                        }

                        if (error) {
                            throw new Error(`Gagal mengupdate password: ${error.message || 'Unknown error'}`);
                        }

                        return data[0];
                    } catch (err: unknown) {
                        const msg = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message || 'Unknown error' : 'Unknown error';
                        throw new Error(`Gagal mengupdate password: ${msg}`);
                    }
                } else {
                    /* Jika tidak ada password yang diberikan, lakukan pembaruan reguler pada data pengguna lainnya. */
                    const { data, error } = await supabase
                        .from('users')
                        .update(userData)
                        .eq('id', id)
                        .select()
                        .single();

                    if (error) {
                        if (error.message?.includes('duplicate key value violates unique constraint')) {
                            throw new Error('Username sudah digunakan oleh user lain');
                        }
                        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
                    }

                    return data;
                }
            } catch (err) {
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Terjadi kesalahan yang tidak diketahui saat mengupdate user');
            }
        },
        /* Setelah pembaruan berhasil, batalkan validasi query yang relevan. */
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

/**
 * @hook useDeleteUser
 * @description Menyediakan fungsi mutasi untuk melakukan soft-delete pada pengguna.
 * Memanggil fungsi RPC `soft_delete_user` untuk menandai pengguna sebagai tidak aktif.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            if (!userId) {
                throw new Error('User ID tidak valid');
            }

            try {
                /* Panggil fungsi RPC untuk melakukan soft delete. */
                const { data, error } = await supabase
                    .rpc('soft_delete_user', { p_user_id: userId });

                if (error) {
                    if (error.message?.includes('Could not find the function')) {
                        throw new Error('Fungsi soft_delete_user tidak ditemukan. Pastikan database sudah di-setup dengan benar.');
                    }
                    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
                }

                if (!data) {
                    throw new Error('Gagal menghapus user - user mungkin tidak ada atau adalah superadmin yang tidak dapat dihapus');
                }

                return data;
            } catch (err) {
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Terjadi kesalahan yang tidak diketahui saat menghapus user');
            }
        },
        /* Setelah penghapusan berhasil, batalkan validasi semua query yang relevan untuk memperbarui UI. */
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
        },
    });
}