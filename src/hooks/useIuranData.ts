'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { IuranSubmission, DashboardStats } from '@/types';

export function useIuranData() {
  return useQuery({
    queryKey: ['iuran'],
    queryFn: async () => {
      // Only get submissions from active users
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

      // Filter only submissions from active users
      const activeSubmissions = data?.filter(
        submission => submission.users?.is_active === true
      ) || [];

      return activeSubmissions as IuranSubmission[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Use the new RPC function that handles active users only
      const { data, error } = await supabase
        .rpc('get_dashboard_stats_active');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalJamaah: 0,
          totalIuranThisMonth: 0,
          submissionThisMonth: 0,
          pendingSubmissions: 0,
        };
      }

      const result = data[0];
      return {
        totalJamaah: result.total_jamaah || 0,
        totalIuranThisMonth: parseFloat(result.total_iuran_this_month) || 0,
        submissionThisMonth: result.submission_this_month || 0,
        pendingSubmissions: result.pending_submissions || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

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
      // Validate required fields
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['iuran'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ 
        queryKey: ['user-submission', result.user_id, result.bulan_tahun] 
      });
    },
  });
}

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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    },
    enabled: !!(userId && monthYear),
  });
}

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
        // Validate ID format more strictly
        if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') {
          throw new Error('ID iuran tidak valid atau kosong. Data mungkin belum dimuat dengan benar.');
        }
        
        const cleanId = id.trim();
        
        // Check if ID is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(cleanId)) {
          throw new Error(`Format ID iuran tidak valid: "${cleanId}". ID harus berupa UUID yang valid.`);
        }
        
        // Remove total_iuran from updateData since it's computed in the database and clean undefined/null
        const cleanData = Object.fromEntries(
          Object.entries(updateData)
            .filter(([key, v]) => key !== 'total_iuran' && v !== undefined && v !== null)
        );
        
        if (Object.keys(cleanData).length === 0) {
          throw new Error('Tidak ada data yang valid untuk diupdate');
        }
        
        const { data, error } = await supabase
          .from('iuran_submissions')
          .update(cleanData)
          .eq('id', cleanId)
          .select()
          .single();

        if (error) {
          // Enhanced error messages for common UUID issues
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['iuran'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ 
        queryKey: ['user-submission', result.user_id, result.bulan_tahun] 
      });
    },
  });
}

export function useDeleteIuran() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (iuranId: string) => {
      // Validate iuranId
      if (!iuranId || iuranId.trim() === '') {
        throw new Error('ID iuran tidak valid atau kosong');
      }
      
      // Check if ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(iuranId.trim())) {
        throw new Error('Format ID iuran tidak valid. ID harus berupa UUID yang valid.');
      }
      
      try {
        // Use RPC function for delete if available, otherwise direct delete
        const { data, error } = await supabase.rpc('delete_iuran_submission', { 
          p_submission_id: iuranId.trim() 
        });

        if (error) {
          // Enhanced error messages for common UUID issues
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iuran'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
