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
import { useAuth } from '@/hooks/useAuth';
import { UserPen, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { User } from '@/types';
import { Select } from '@/components/ui/Select';

const editUserSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  role: z.enum(['admin', 'jamaah', 'superadmin'], { 
    required_error: 'Role harus dipilih',
    invalid_type_error: 'Role harus dipilih. Silakan pilih Admin atau Jamaah.'
  }),
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<EditUserFormData | null>(null);
  const updateUserMutation = useUpdateUser();
  const { user: currentUser, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });


  // Populate form when user changes
  useEffect(() => {
    if (user && isOpen) {
      // Username is read-only, so we don't need to set it via form
      setValue('full_name', user.full_name);
      setValue('role', user.role as 'admin' | 'jamaah' | 'superadmin');
      setValue('password', '');
      setValue('confirmPassword', '');
    }
  }, [user, isOpen, setValue]);

  const onSubmit = (data: EditUserFormData) => {
    if (!user) return;
    
    if (!showConfirmation) {
      // First click - show inline confirmation
      setPendingData(data);
      setShowConfirmation(true);
      return;
    }
    
    // Second click - actually submit
    handleConfirmUpdate();
  };

  const handleConfirmUpdate = async () => {
    if (!user || !pendingData) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    
    const updateData: any = {
      id: user.id,
      // Username is not included since it's readonly
      full_name: pendingData.full_name,
      role: pendingData.role,
    };

    // Only include password if it's provided
    if (pendingData.password && pendingData.password.length > 0) {
      updateData.password = pendingData.password;
    }

    updateUserMutation.mutate(updateData, {
      onSuccess: () => {
        // Update current user state if editing own profile
        if (currentUser && user.id === currentUser.id) {
          setUser({
            ...currentUser,
            full_name: pendingData.full_name,
            role: pendingData.role,
          });
        }
        
        setSuccessMessage(`User "${user.username}" berhasil diupdate!`);
        setShowConfirmation(false);
        setPendingData(null);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          reset();
          setSuccessMessage('');
          onClose();
        }, 2000);
      },
      onError: (error: any) => {
        console.error('Error updating user:', error);
        
        // Enhanced error handling for better debugging
        let displayError = 'Gagal mengupdate user';
        
        if (error?.message) {
          displayError = error.message;
        } else if (error?.error?.message) {
          displayError = error.error.message;
        } else if (typeof error === 'string') {
          displayError = error;
        }
        
        console.log('Setting error message:', displayError); // Debug log
        setErrorMessage(displayError);
      }
    });
  };

  const handleClose = () => {
    reset();
    setErrorMessage('');
    setSuccessMessage('');
    setShowConfirmation(false);
    setPendingData(null);
    onClose();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingData(null);
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
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-1">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">ⓘ</span>
            <span>Username tidak dapat diubah karena bersifat unik dan digunakan sebagai identifier sistem</span>
          </p>
        </div>

        <Input
          label="Nama Lengkap"
          {...register('full_name')}
          error={errors.full_name?.message}
          placeholder="Masukkan nama lengkap"
          disabled={updateUserMutation.isPending || showConfirmation}
        />

        <div className="space-y-2">
          <label className="text-caption text-gray-700 dark:text-gray-300">
            Role
          </label>
          {user.role === 'superadmin' ? (
            <>
              <input
                type="text"
                value="Superadmin"
                disabled={true}
                className="glass-input font-normal text-base w-full bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed"
                title="Role SUPERADMIN tidak dapat diubah"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-1">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">ⓘ</span>
                <span>Role SUPERADMIN tidak dapat diubah untuk menjaga keamanan sistem</span>
              </p>
            </>
          ) : (
            <>
              <Select
                value={watch('role') || user.role}
                onChange={(val) => setValue('role', val as 'admin' | 'jamaah', { shouldValidate: true, shouldDirty: true })}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'jamaah', label: 'Jamaah' },
                ]}
                className="w-full"
                buttonClassName="font-normal text-base"
                disabled={updateUserMutation.isPending || showConfirmation}
              />
              {errors.role && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
              )}
            </>
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

          <div className="space-y-2">
            <label className="text-caption text-gray-700 dark:text-gray-300">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="glass-input font-normal text-base w-full pr-10"
                placeholder="Kosongkan jika tidak ingin mengubah"
                disabled={updateUserMutation.isPending || showConfirmation}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={updateUserMutation.isPending || showConfirmation}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-caption text-gray-700 dark:text-gray-300">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="glass-input font-normal text-base w-full pr-10"
                placeholder="Konfirmasi password baru"
                disabled={updateUserMutation.isPending || showConfirmation}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={updateUserMutation.isPending || showConfirmation}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword?.message}</p>
            )}
          </div>
        </div>

        {/* Inline Confirmation Warning */}
        {showConfirmation && (
          <Card className="bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                    Konfirmasi Update User
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Anda akan mengupdate data user <strong>"{user.username}"</strong>. Klik "Konfirmasi" untuk melanjutkan atau "Batal" untuk membatalkan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={showConfirmation ? handleCancelConfirmation : handleClose}
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
            variant={showConfirmation ? "warning" : "default"}
          >
            {showConfirmation ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Konfirmasi
              </>
            ) : (
              <>
                <UserPen className="mr-2 h-4 w-4" />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
