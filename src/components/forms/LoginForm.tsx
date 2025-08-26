'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { DatabaseTest } from '@/components/debug/DatabaseTest';
import { EnvCheck } from '@/components/debug/EnvCheck';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    const result = await login(data.username, data.password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login gagal');
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
            SIDIQ
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-300 mb-1">
            Sistem Informasi Pengelolaan Data Infaq
          </p>
          <p className="text-body-small text-gray-500 dark:text-gray-400">
            Kelompok 3 - Jatiluhur
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/50 rounded-lg p-4">
            <p className="text-red-900 dark:text-red-100 text-sm">{error}</p>
          </div>
        )}

        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message}
          placeholder="Masukkan username"
          disabled={isLoading}
        />

        <div className="space-y-2">
          <label className="text-caption text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="glass-input font-normal text-base w-full pr-10"
              placeholder="Masukkan password"
              disabled={isLoading}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.password?.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isLoading ? 'Masuk...' : 'Masuk'}
        </Button>

        <div className="text-center">
          <p className="text-body-small text-gray-600 dark:text-gray-300">
            Default SUPERADMIN: ZulfaNurhuda / Zn.9192631770
          </p>
        </div>
      </form>
      
      <div className="mt-6 space-y-4">
        <EnvCheck />
        <DatabaseTest />
      </div>
    </>
  );
}