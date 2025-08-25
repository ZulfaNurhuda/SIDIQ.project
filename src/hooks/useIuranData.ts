'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { IuranSubmission, DashboardStats } from '@/types';
import { getCurrentMonthYearString } from '@/lib/utils';

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
      console.log('useSubmitIuran received data:', data); // Debug log
      
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

      console.log('Supabase upsert result:', { result, error }); // Debug log

      if (error) {
        console.error('Supabase upsert error:', error);
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
        console.log('Updating iuran:', { id, updateData });
        
        // Remove total_iuran from updateData since it's computed in the database
        const { total_iuran, ...dataWithoutTotal } = updateData;
        
        const { data, error } = await supabase
          .from('iuran_submissions')
          .update(dataWithoutTotal)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message || 'Unknown error'}`);
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