'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { useCreateUser } from '@/hooks/useUsers';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const userSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username hanya boleh berisi huruf, angka, titik (.), dan underscore (_)'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  role: z.enum(['admin', 'jamaah'], { required_error: 'Role harus dipilih' }),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserForm({ isOpen, onClose }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await createUserMutation.mutateAsync({
        username: data.username,
        full_name: data.full_name,
        role: data.role,
        password: data.password,
      });
      
      if (result?.is_reactivated) {
        setSuccessMessage(
          `User "${data.username}" berhasil direaktifkan! Data iuran sebelumnya telah tersambung kembali.`
        );
      } else {
        setSuccessMessage(`User "${data.username}" berhasil dibuat!`);
      }
      
      // Auto close after 2 seconds
      setTimeout(() => {
        reset();
        setSuccessMessage('');
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      setErrorMessage(error.message || 'Gagal membuat user');
    }
  };

  const handleClose = () => {
    reset();
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah User Baru" size="md">
      {/* Success Message */}
      {successMessage && (
        <Card className="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                {successMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Card className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message}
          placeholder="Masukkan username"
          disabled={createUserMutation.isPending}
        />

        <Input
          label="Nama Lengkap"
          {...register('full_name')}
          error={errors.full_name?.message}
          placeholder="Masukkan nama lengkap"
          disabled={createUserMutation.isPending}
        />

        <div className="space-y-2">
          <label className="text-caption text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            {...register('role')}
            className="glass-input font-normal text-base w-full"
            disabled={createUserMutation.isPending}
          >
            <option value="">Pilih role</option>
            <option value="admin">Admin</option>
            <option value="jamaah">Jamaah</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={errors.password?.message}
            placeholder="Masukkan password"
            disabled={createUserMutation.isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={createUserMutation.isPending}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Konfirmasi Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Konfirmasi password"
            disabled={createUserMutation.isPending}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={createUserMutation.isPending}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={createUserMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={createUserMutation.isPending}
            disabled={createUserMutation.isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </form>
    </Modal>
  );
}