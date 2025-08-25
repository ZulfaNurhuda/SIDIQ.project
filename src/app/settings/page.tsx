'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUser } from '@/hooks/useUsers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { 
  Settings,
  User,
  Shield,
  Palette,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string()
    .min(6, 'Password minimal 6 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, login, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'system'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.full_name || '',
    },
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdatingPassword(true);
    
    if (!user) return;
    
    try {
      // First verify current password by attempting to authenticate
      const authResult = await login(user.username, data.currentPassword);
      
      if (!authResult.success) {
        setErrorMessage('Password saat ini salah. Silakan periksa kembali.');
        setIsUpdatingPassword(false);
        return;
      }
      
      // If current password is correct, update to new password
      // COPY EXACT METHOD FROM EditUserForm!
      const updateData: any = {
        id: user.id,
        full_name: user.full_name, // Keep current full_name
        role: user.role, // Keep current role
      };

      // Only include password if it's provided
      if (data.newPassword && data.newPassword.length > 0) {
        updateData.password = data.newPassword;
      }

      updateUserMutation.mutate(updateData, {
        onSuccess: () => {
          setSuccessMessage('Password berhasil diubah!');
          passwordForm.reset();
          setIsUpdatingPassword(false);
        },
        onError: (error: any) => {
          console.error('Error changing password:', error);
          
          let displayError = 'Gagal mengubah password';
          if (error?.message) {
            displayError = error.message;
          } else if (error?.error?.message) {
            displayError = error.error.message;
          }
          
          setErrorMessage(displayError);
          setIsUpdatingPassword(false);
        }
      });
    } catch (error) {
      console.error('Unexpected error in password change:', error);
      setErrorMessage('Terjadi kesalahan yang tidak terduga');
      setIsUpdatingPassword(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdatingProfile(true);
    
    if (!user) return;
    
    updateUserMutation.mutate({
      id: user.id,
      full_name: data.fullName,
    }, {
      onSuccess: () => {
        // Update current user state
        setUser({
          ...user,
          full_name: data.fullName,
        });
        
        setSuccessMessage('Profile berhasil diupdate!');
        setIsUpdatingProfile(false);
      },
      onError: (error: any) => {
        console.error('Error updating profile:', error);
        
        let displayError = 'Gagal mengupdate profile';
        if (error?.message) {
          displayError = error.message;
        } else if (error?.error?.message) {
          displayError = error.error.message;
        }
        
        setErrorMessage(displayError);
        setIsUpdatingProfile(false);
      }
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'jamaah':
        return 'success';
      default:
        return 'default';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    ...(user?.role === 'superadmin' ? [{ id: 'system', label: 'Sistem', icon: Database }] : []),
  ];

  // Reset activeTab if user is not superadmin and currently on system tab
  useEffect(() => {
    if (user?.role !== 'superadmin' && activeTab === 'system') {
      setActiveTab('profile');
    }
  }, [user?.role, activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Pengaturan
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Kelola pengaturan akun dan sistem
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Card className="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800">
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

      {errorMessage && (
        <Card className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800">
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

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-4">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-300/50'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Content */}
      <div>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Username
                    </label>
                    <div className="mt-1 p-3 glass-input bg-gray-100/50 dark:bg-gray-800/50">
                      {user?.username}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Username tidak dapat diubah
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Role
                    </label>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(user?.role || '')}>
                        {user?.role?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Editable Profile Form */}
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    {...profileForm.register('fullName')}
                    error={profileForm.formState.errors.fullName?.message}
                    placeholder="Masukkan nama lengkap"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      isLoading={isUpdatingProfile}
                      disabled={isUpdatingProfile}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        className="glass-input font-normal text-base w-full bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed"
                        placeholder="Masukkan password saat ini"
                        disabled={true}
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Fitur ubah password mandiri saat ini dinonaktifkan</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        className="glass-input font-normal text-base w-full bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed"
                        placeholder="Masukkan password baru"
                        disabled={true}
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Fitur ubah password mandiri saat ini dinonaktifkan</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        className="glass-input font-normal text-base w-full bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed"
                        placeholder="Konfirmasi password baru"
                        disabled={true}
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Fitur ubah password mandiri saat ini dinonaktifkan</span>
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit"
                      isLoading={isUpdatingPassword}
                      disabled={isUpdatingPassword}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Ubah Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Tampilan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pilih tema tampilan aplikasi
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Warna Aksen</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming Soon</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Notifikasi</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming Soon</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Layout</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming Soon</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.role === 'superadmin' && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Database</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                          <Download className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Backup Database</div>
                            <div className="text-xs opacity-80">Export semua data</div>
                          </div>
                        </Button>

                        <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                          <Upload className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Restore Database</div>
                            <div className="text-xs opacity-80">Import data backup</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                Reset Database
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                Ini akan menghapus SEMUA data termasuk user dan iuran. Tindakan ini tidak dapat dibatalkan!
                              </p>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Database
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {user?.role !== 'superadmin' && (
                  <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                            Akses Terbatas
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Pengaturan sistem hanya dapat diakses oleh SUPERADMIN.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}