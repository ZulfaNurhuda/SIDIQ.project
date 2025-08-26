'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    setLoading(false);
  }, [setLoading]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // First check if username exists
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id, username, is_active')
        .eq('username', username)
        .maybeSingle();

      if (userCheckError) {
        throw new Error(`Database error: ${userCheckError.message}`);
      }

      // If user doesn't exist
      if (!userCheck) {
        throw new Error('USER_NOT_FOUND');
      }

      // If user is not active
      if (!userCheck.is_active) {
        throw new Error('USER_INACTIVE');
      }

      // Now try to authenticate with the RPC function
      const { data, error } = await supabase.rpc('authenticate_user', {
        input_username: username,
        input_password: password
      });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

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
        
        setUser(user);
        return { success: true };
      } else {
        // If we get here, username exists but password is wrong
        throw new Error('WRONG_PASSWORD');
      }
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan sistem';
      
      if (error.message === 'USER_NOT_FOUND') {
        errorMessage = '❌ Username tidak ditemukan. Periksa kembali username Anda.';
      } else if (error.message === 'USER_INACTIVE') {
        errorMessage = '🚫 Akun Anda tidak aktif. Hubungi administrator untuk mengaktifkan akun.';
      } else if (error.message === 'WRONG_PASSWORD') {
        errorMessage = '🔒 Password salah. Periksa kembali password Anda.';
      } else if (error.message?.includes('Database error')) {
        errorMessage = '🔧 Koneksi database gagal. Periksa konfigurasi Supabase.';
      } else if (error.message?.includes('Failed to fetch')) {
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

  const signOut = async () => {
    try {
      // Clear current user session in database
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user_id',
        new_value: '00000000-0000-0000-0000-000000000000',
        is_local: true
      });
      
      logout();
      router.push('/login');
    } catch (error) {
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

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: string[], redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  return { hasAccess: user && allowedRoles.includes(user.role), isLoading };
}