'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { useUpdateUser } from '@/hooks/useUsers';
import { UserPen, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '@/types';

const editUserSchema = z.object({
  username: z.string(), // Username is readonly, no validation needed
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  role: z.enum(['admin', 'jamaah'], { required_error: 'Role harus dipilih' }),
  password: z.string()
    .optional()
    .or(z.string().min(6, 'Password minimal 6 karakter').regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function EditUserForm({ isOpen, onClose, user }: EditUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Populate form when user changes
  useEffect(() => {
    if (user && isOpen) {
      // Username is read-only, so we don't need to set it via form
      setValue('full_name', user.full_name);
      setValue('role', user.role as 'admin' | 'jamaah');
      setValue('password', '');
      setValue('confirmPassword', '');
    }
  }, [user, isOpen, setValue]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const updateData: any = {
        id: user.id,
        // Username is not included since it's readonly
        full_name: data.full_name,
        role: data.role,
      };

      // Only include password if it's provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      await updateUserMutation.mutateAsync(updateData);
      
      setSuccessMessage(`User "${data.username}" berhasil diupdate!`);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        reset();
        setSuccessMessage('');
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      setErrorMessage(error.message || 'Gagal mengupdate user');
    }
  };

  const handleClose = () => {
    reset();
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="md">
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
        <div className="space-y-2">
          <label className="text-caption text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            value={user.username}
            disabled={true}
            className="glass-input font-normal text-base w-full bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed"
            title="Username tidak dapat diubah karena merupakan identifier unik"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start space-x-1">
            <span className="text-amber-500 mt-0.5">ⓘ</span>
            <span>Username tidak dapat diubah karena bersifat unik dan digunakan sebagai identifier sistem</span>
          </p>
        </div>

        <Input
          label="Nama Lengkap"
          {...register('full_name')}
          error={errors.full_name?.message}
          placeholder="Masukkan nama lengkap"
          disabled={updateUserMutation.isPending}
        />

        <div className="space-y-2">
          <label className="text-caption text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            {...register('role')}
            className="glass-input font-normal text-base w-full"
            disabled={updateUserMutation.isPending}
          >
            <option value="">Pilih role</option>
            <option value="admin">Admin</option>
            <option value="jamaah">Jamaah</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
              Ubah Password (Opsional)
            </span>
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          </div>

          <div className="relative">
            <Input
              label="Password Baru"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              placeholder="Kosongkan jika tidak ingin mengubah"
              disabled={updateUserMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={updateUserMutation.isPending}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Konfirmasi Password Baru"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Konfirmasi password baru"
              disabled={updateUserMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={updateUserMutation.isPending}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={updateUserMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={updateUserMutation.isPending}
            disabled={updateUserMutation.isPending}
          >
            <UserPen className="mr-2 h-4 w-4" />
            Update User
          </Button>
        </div>
      </form>
    </Modal>
  );
}