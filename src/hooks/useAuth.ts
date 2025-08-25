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
      
      // Call custom authentication function
      const { data, error } = await supabase.rpc('authenticate_user', {
        input_username: username,
        input_password: password
      });

      console.log('Auth response:', { data, error }); // Debug log

      if (error) {
        console.error('Supabase RPC error:', error);
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
        throw new Error('Username atau password salah. Pastikan sudah menjalankan SQL setup di Supabase.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Terjadi kesalahan sistem';
      
      if (error.message?.includes('Database error')) {
        errorMessage = 'Koneksi database gagal. Periksa konfigurasi Supabase.';
      } else if (error.message?.includes('Username atau password salah')) {
        errorMessage = 'Username atau password salah. Pastikan SQL setup sudah dijalankan.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa URL Supabase.';
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
      console.error('Error during logout:', error);
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