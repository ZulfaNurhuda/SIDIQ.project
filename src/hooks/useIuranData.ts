/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini berisi custom hooks untuk mengambil dan memanipulasi data 'iuran' menggunakan @tanstack/react-query.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { IuranSubmission, DashboardStats } from '@/types';

/**
 * @hook useIuranData
 * @description Mengambil semua data iuran dari pengguna yang aktif.
 * Melakukan join dengan tabel 'users' untuk memfilter berdasarkan `is_active`.
 * @returns {QueryResult} Hasil query yang berisi data iuran.
 */
export function useIuranData() {
    return useQuery({
        queryKey: ['iuran'],
        queryFn: async () => {
            /* Ambil data iuran beserta data pengguna terkait. */
            const { data, error } = await supabase
                .from('iuran_submissions')
                .select(`
          *,
          users:user_id (
            username,
            full_name,
            is_active
          )
        `)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            /* Filter data iuran dari pengguna yang tidak aktif di sisi klien. */
            const activeSubmissions = data?.filter(
                submission => submission.users?.is_active === true
            ) || [];

            return activeSubmissions as IuranSubmission[];
        },
        /* Cache data selama 5 menit. */
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * @hook useDashboardStats
 * @description Mengambil statistik untuk dashboard dari fungsi RPC Supabase.
 * Fungsi RPC `get_dashboard_stats_active` bertanggung jawab untuk kalkulasi berdasarkan pengguna aktif.
 * @returns {QueryResult<DashboardStats>} Hasil query yang berisi statistik dashboard.
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async (): Promise<DashboardStats> => {
            /* Panggil fungsi RPC untuk mendapatkan statistik dashboard agregat. */
            const { data, error } = await supabase
                .rpc('get_dashboard_stats_active');

            if (error) {
                throw error;
            }

            /* Kembalikan statistik default jika tidak ada data yang diterima. */
            if (!data || data.length === 0) {
                return {
                    totalJamaah: 0,
                    totalIuranThisMonth: 0,
                    submissionThisMonth: 0,
                    pendingSubmissions: 0,
                };
            }

            /* Parse dan kembalikan statistik dari respons RPC. */
            const result = data[0];
            return {
                totalJamaah: result.total_jamaah || 0,
                totalIuranThisMonth: parseFloat(result.total_iuran_this_month) || 0,
                submissionThisMonth: result.submission_this_month || 0,
                pendingSubmissions: result.pending_submissions || 0,
            };
        },
        /* Cache data selama 5 menit. */
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * @hook useSubmitIuran
 * @description Menyediakan fungsi mutasi untuk mengirim atau memperbarui data iuran.
 * Menggunakan `upsert` untuk membuat data baru atau memperbarui yang sudah ada berdasarkan constraint konflik.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useSubmitIuran() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            iuran_1: number;
            iuran_2: number;
            iuran_3: number;
            iuran_4: number;
            iuran_5: number;
            bulan_tahun: string;
            user_id: string;
            username: string;
            nama_jamaah: string;
        }) => {
            /* Validasi field yang wajib diisi sebelum mengirim ke database. */
            if (!data.user_id) {
                throw new Error('User ID tidak valid');
            }
            if (!data.username) {
                throw new Error('Username tidak valid');
            }
            if (!data.nama_jamaah) {
                throw new Error('Nama jamaah tidak valid');
            }
            if (!data.bulan_tahun) {
                throw new Error('Bulan tahun tidak valid');
            }

            /* Lakukan operasi upsert. Jika data dengan user_id dan bulan_tahun yang sama sudah ada, data akan diperbarui. */
            const { data: result, error } = await supabase
                .from('iuran_submissions')
                .upsert(data, {
                    onConflict: 'user_id,bulan_tahun',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return result;
        },
        /* Setelah mutasi berhasil, batalkan validasi query yang relevan untuk mengambil ulang data. */
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({
                queryKey: ['user-submission', result.user_id, result.bulan_tahun]
            });
        },
    });
}

/**
 * @hook useUserSubmissionForMonth
 * @description Mengambil data iuran pengguna tertentu untuk bulan dan tahun yang diberikan.
 * @param {string} userId - ID pengguna.
 * @param {string} monthYear - String bulan dan tahun (contoh: "YYYY-MM-DD").
 * @returns {QueryResult} Hasil query yang berisi data iuran spesifik.
 */
export function useUserSubmissionForMonth(userId: string, monthYear: string) {
    return useQuery({
        queryKey: ['user-submission', userId, monthYear],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('iuran_submissions')
                .select('*')
                .eq('user_id', userId)
                .eq('bulan_tahun', monthYear)
                .single();

            /* Abaikan error jika tidak ada baris yang ditemukan, karena ini adalah hasil yang diharapkan. */
            if (error && error.code !== 'PGRST116') { /* PGRST116 = tidak ada baris ditemukan */
                throw error;
            }

            return data;
        },
        /* Query hanya akan berjalan jika userId dan monthYear tersedia. */
        enabled: !!(userId && monthYear),
    });
}

/**
 * @hook useUpdateIuran
 * @description Menyediakan fungsi mutasi untuk memperbarui data iuran yang ada berdasarkan ID-nya.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useUpdateIuran() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...updateData
        }: {
            id: string;
            iuran_1?: number;
            iuran_2?: number;
            iuran_3?: number;
            iuran_4?: number;
            iuran_5?: number;
            total_iuran?: number;
        }) => {
            try {
                /* Validasi ketat untuk ID iuran. */
                if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') {
                    throw new Error('ID iuran tidak valid atau kosong. Data mungkin belum dimuat dengan benar.');
                }

                const cleanId = id.trim();

                /* Validasi bahwa ID dalam format UUID. */
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(cleanId)) {
                    throw new Error(`Format ID iuran tidak valid: "${cleanId}". ID harus berupa UUID yang valid.`);
                }

                /* Hapus total_iuran dan nilai undefined/null sebelum memperbarui. */
                const cleanData = Object.fromEntries(
                    Object.entries(updateData)
                        .filter(([key, v]) => key !== 'total_iuran' && v !== undefined && v !== null)
                );

                if (Object.keys(cleanData).length === 0) {
                    throw new Error('Tidak ada data yang valid untuk diupdate');
                }

                /* Lakukan operasi update. */
                const { data, error } = await supabase
                    .from('iuran_submissions')
                    .update(cleanData)
                    .eq('id', cleanId)
                    .select()
                    .single();

                if (error) {
                    /* Berikan pesan error yang lebih spesifik untuk masalah database umum. */
                    if (error.message.includes('invalid input syntax for type uuid')) {
                        throw new Error(`Database error: Format UUID tidak valid "${cleanId}". Pastikan data telah dimuat dengan benar. Coba refresh halaman.`);
                    } else if (error.code === 'PGRST116') {
                        throw new Error('Data iuran tidak ditemukan. Mungkin sudah dihapus atau tidak ada akses.');
                    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
                        throw new Error(`Database error: Kolom tidak ditemukan. Periksa struktur database.`);
                    }

                    throw new Error(`Database error: ${error.message}. Periksa koneksi database atau refresh halaman.`);
                }

                if (!data) {
                    throw new Error('Update berhasil tetapi tidak ada data yang dikembalikan');
                }

                return data;
            } catch (err) {
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Terjadi kesalahan yang tidak diketahui saat mengupdate iuran');
            }
        },
        /* Setelah mutasi berhasil, batalkan validasi query yang relevan untuk mengambil ulang data. */
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({
                queryKey: ['user-submission', result.user_id, result.bulan_tahun]
            });
        },
    });
}

/**
 * @hook useDeleteIuran
 * @description Menyediakan fungsi mutasi untuk menghapus data iuran berdasarkan ID-nya.
 * @returns {MutationResult} Hasil mutasi, termasuk fungsi mutasi.
 */
export function useDeleteIuran() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (iuranId: string) => {
            /* Validasi format iuranId sebelum melanjutkan. */
            if (!iuranId || iuranId.trim() === '') {
                throw new Error('ID iuran tidak valid atau kosong');
            }

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(iuranId.trim())) {
                throw new Error('Format ID iuran tidak valid. ID harus berupa UUID yang valid.');
            }

            try {
                /* Panggil fungsi RPC untuk penghapusan, yang dapat menangani penghapusan berantai atau logika lainnya. */
                const { data, error } = await supabase.rpc('delete_iuran_submission', {
                    p_submission_id: iuranId.trim()
                });

                if (error) {
                    if (error.message.includes('invalid input syntax for type uuid')) {
                        throw new Error(`Database error: invalid input syntax for type uuid: "${iuranId}". Check database setup.`);
                    }

                    throw new Error(`Database error: ${error.message}. Check database setup.`);
                }

                if (!data) {
                    throw new Error('Gagal menghapus data iuran - data mungkin tidak ada');
                }

                return data;
            } catch (err) {
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Terjadi kesalahan yang tidak diketahui saat menghapus iuran');
            }
        },
        /* Setelah penghapusan berhasil, batalkan validasi query untuk memperbarui UI. */
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}