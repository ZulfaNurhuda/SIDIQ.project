'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Use RPC function to get only active users
      const { data, error } = await supabase
        .rpc('get_active_users');

      if (error) {
        throw error;
      }

      return data as User[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

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
        const { data, error } = await supabase.rpc('add_new_user', {
          p_username: userData.username,
          p_full_name: userData.full_name,
          p_password: userData.password,
          p_role: userData.role,
        });

        if (error) {
          console.error('Supabase RPC error (add_new_user):', error);
          
          // Handle specific error types
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

        return data[0]; // Return first row from the RPC function result
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Terjadi kesalahan yang tidak diketahui saat membuat user');
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['iuran'] });
      
      // Show notification if user was reactivated
      if (result?.is_reactivated) {
        console.log('User dengan username ini telah direaktifkan dan data iuran sebelumnya telah tersambung kembali.');
      }
    },
  });
}

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
      role?: 'admin' | 'jamaah';
      password?: string;
    }) => {
      try {
        console.log('Updating user:', { id, userData, hasPassword: !!password }); // Debug log
        
        // If password is provided, use RPC function to update with password hashing
        if (password) {
          const { data, error } = await supabase.rpc('update_user_without_username', {
            p_user_id: id,
            p_full_name: userData.full_name,
            p_role: userData.role,
            p_password: password
          });
          
          console.log('RPC update result:', { data, error }); // Debug log
          
          if (error) {
            console.error('Supabase RPC error (update_user_with_password):', error);
            
            if (error.message?.includes('Could not find the function')) {
              throw new Error('Fungsi update user tidak ditemukan. Pastikan database sudah di-setup dengan benar.');
            }
            
            throw new Error(`Database error: ${error.message || 'Unknown error'}`);
          }
          
          return data?.[0] || data;
        } else {
          // If no password, use regular update
          const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error('Supabase update error:', error);
            
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Attempting to delete user:', userId); // Debug log
      
      // Validate userId
      if (!userId) {
        throw new Error('User ID tidak valid');
      }
      
      try {
        // Use RPC function for soft delete
        const { data, error } = await supabase
          .rpc('soft_delete_user', { p_user_id: userId });

        console.log('Soft delete result:', { data, error }); // Debug log

        if (error) {
          console.error('Supabase RPC error (soft_delete_user):', error);
          
          // Handle specific error types
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['iuran'] });
    },
  });
}