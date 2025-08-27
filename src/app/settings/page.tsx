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
import { PageTitle } from '@/components/ui/PageTitle';
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
  Info,
  Lock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Modal } from '@/components/ui/Modal';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string()
    .min(6, 'Password minimal 6 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak sesuai',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'system'>('profile');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

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

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdatingPassword(true);
    
    if (!user) return;

    try {
      // First verify current password by attempting to authenticate
      const { data: authResult, error: authError } = await supabase.rpc('authenticate_user', {
        input_username: user.username,
        input_password: data.currentPassword
      });

      if (authError || !authResult || authResult.length === 0) {
        setErrorMessage('Password saat ini salah');
        setIsUpdatingPassword(false);
        return;
      }

      // If current password is correct, update to new password using proper RPC function
      const { data: updateResult, error: updateError } = await supabase.rpc('update_user_with_password', {
        p_user_id: user.id,
        p_username: user.username,
        p_full_name: user.full_name,
        p_role: user.role,
        p_password: data.newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Gagal mengubah password');
      }

      // Success
      setSuccessMessage('Password berhasil diubah!');
      setIsUpdatingPassword(false);
      passwordForm.reset();

    } catch (error: any) {
      
      let displayError = 'Gagal mengubah password';
      if (error?.message) {
        displayError = error.message;
      }
      
      setErrorMessage(displayError);
      setIsUpdatingPassword(false);
    }
  };

  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Get all users data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (usersError) throw usersError;
      
      // Get all iuran submissions data
      const { data: iuranData, error: iuranError } = await supabase
        .from('iuran_submissions')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (iuranError) throw iuranError;
      
      // Create backup object
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          users: usersData || [],
          iuran_submissions: iuranData || []
        }
      };
      
      // Create and download backup file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      // Format: YYYY-MM-DDTHH-mm-ss (ISO-8601 dengan waktu lokal)
      const now = new Date();
      const timestamp = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + '-' +
        String(now.getMinutes()).padStart(2, '0') + '-' +
        String(now.getSeconds()).padStart(2, '0');
      a.href = url;
      a.download = `sidiq_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Backup database berhasil! File telah diunduh.');
      setShowBackupModal(false);
      
    } catch (error: any) {
      setErrorMessage(`Gagal backup database: ${error.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleRestoreDatabase = async () => {
    if (!restoreFile) {
      setErrorMessage('Pilih file backup terlebih dahulu');
      return;
    }
    
    setIsRestoring(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Read and parse backup file
      const fileContent = await restoreFile.text();
      const backup = JSON.parse(fileContent);
      
      // Validate backup structure
      if (!backup.data || !backup.data.users || !backup.data.iuran_submissions) {
        throw new Error('Format file backup tidak valid');
      }
      
      // Clear existing data (except superadmin)
      await supabase
        .from('iuran_submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      await supabase
        .from('users')
        .delete()
        .neq('role', 'superadmin'); // Keep superadmin
      
      // Restore users (skip superadmin if exists)
      for (const userData of backup.data.users) {
        if (userData.role !== 'superadmin') {
          const { error } = await supabase
            .from('users')
            .insert({
              id: userData.id,
              username: userData.username,
              full_name: userData.full_name,
              password_hash: userData.password_hash,
              role: userData.role,
              is_active: userData.is_active,
              deleted_at: userData.deleted_at,
              created_at: userData.created_at,
              updated_at: userData.updated_at
            });
          
          if (error) {
          }
        }
      }
      
      // Restore iuran submissions
      for (const iuranData of backup.data.iuran_submissions) {
        const { error } = await supabase
          .from('iuran_submissions')
          .insert({
            id: iuranData.id,
            user_id: iuranData.user_id,
            username: iuranData.username,
            nama_jamaah: iuranData.nama_jamaah,
            bulan_tahun: iuranData.bulan_tahun,
            timestamp_submitted: iuranData.timestamp_submitted,
            iuran_1: iuranData.iuran_1,
            iuran_2: iuranData.iuran_2,
            iuran_3: iuranData.iuran_3,
            iuran_4: iuranData.iuran_4,
            iuran_5: iuranData.iuran_5,
            created_at: iuranData.created_at,
            updated_at: iuranData.updated_at
          });
        
        if (error) {
        }
      }
      
      setSuccessMessage('Restore database berhasil! Data telah dipulihkan.');
      setShowRestoreModal(false);
      setRestoreFile(null);
      
      // Refresh page after restore
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setErrorMessage(`Gagal restore database: ${error.message}`);
    } finally {
      setIsRestoring(false);
    }
  };
  
  const handleResetDatabase = async () => {
    setIsResetting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Delete all iuran submissions
      await supabase
        .from('iuran_submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      // Delete all users except superadmin
      await supabase
        .from('users')
        .delete()
        .neq('role', 'superadmin'); // Keep superadmin
      
      setSuccessMessage('Database berhasil direset! Semua data kecuali superadmin telah dihapus.');
      setShowResetModal(false);
      
      // Refresh page after reset
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setErrorMessage(`Gagal reset database: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
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
      <PageTitle
        title="Pengaturan"
        description="Kelola pengaturan akun dan sistem"
        icon={Settings}
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <Card className="bg-green-500/20 dark:bg-green-900/20 border-green-400/60 dark:border-green-800">
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
        <Card className="bg-red-500/20 dark:bg-red-900/20 border-red-400/60 dark:border-red-800">
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
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-blue-900 dark:text-white">Informasi Profile</span>
                </CardTitle>
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
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-blue-900 dark:text-white">Keamanan Akun</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Masukkan password saat ini"
                          {...passwordForm.register('currentPassword')}
                          error={passwordForm.formState.errors.currentPassword?.message}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password Baru
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Masukkan password baru"
                          {...passwordForm.register('newPassword')}
                          error={passwordForm.formState.errors.newPassword?.message}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Konfirmasi password baru"
                          {...passwordForm.register('confirmPassword')}
                          error={passwordForm.formState.errors.confirmPassword?.message}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit"
                      isLoading={isUpdatingPassword}
                      disabled={isUpdatingPassword}
                    >
                      <Lock className="mr-2 h-4 w-4" />
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
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                    <Palette className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-blue-900 dark:text-white">Pengaturan Tampilan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tema</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pilih tema tampilan aplikasi
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="border-t border-gray-300/70 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Warna Aksen</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Notifikasi</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600">
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Tata Letak</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p>
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
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                    <Database className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-blue-900 dark:text-white">Pengaturan Sistem</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.role === 'superadmin' && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Database</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex-col space-y-2"
                          onClick={() => setShowBackupModal(true)}
                          disabled={isBackingUp}
                        >
                          <Download className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Backup Database</div>
                            <div className="text-xs opacity-80">Export semua data</div>
                          </div>
                        </Button>

                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex-col space-y-2"
                          onClick={() => setShowRestoreModal(true)}
                          disabled={isRestoring}
                        >
                          <Upload className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Restore Database</div>
                            <div className="text-xs opacity-80">Import data backup</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-gray-300/70 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Zona Berbahaya</h3>
                      <Card className="border-red-400/60 dark:border-red-800 bg-red-500/20 dark:bg-red-900/20">
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
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => setShowResetModal(true)}
                                disabled={isResetting}
                              >
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
                  <Card className="border-amber-400/60 dark:border-amber-800 bg-amber-500/20 dark:bg-amber-900/20">
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
      
      {/* Backup Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleBackupDatabase}
        title="Backup Database"
        message="Apakah Anda yakin ingin membackup database? File backup akan diunduh ke komputer Anda."
        confirmText="Ya, Backup"
        isLoading={isBackingUp}
        variant="info"
      />
      
      {/* Custom Restore Modal */}
      <Modal 
        isOpen={showRestoreModal} 
        onClose={() => {
          setShowRestoreModal(false);
          setRestoreFile(null);
        }}
        title="Restore Database"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>PERINGATAN:</strong> Restore akan menghapus semua data yang ada (kecuali superadmin) dan menggantinya dengan data dari file backup.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih File Backup
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              className="glass-input w-full cursor-pointer file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary-500/20 file:text-primary-900 dark:file:text-primary-100 file:rounded-md file:cursor-pointer hover:file:bg-primary-500/30 file:backdrop-blur-sm file:border file:border-primary-300/50 transition-all duration-300"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              Hanya file JSON yang diizinkan
            </p>
          </div>
          
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRestoreModal(false);
                setRestoreFile(null);
              }}
              className="flex-1"
              disabled={isRestoring}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="warning"
              onClick={handleRestoreDatabase}
              className="flex-1"
              isLoading={isRestoring}
              disabled={isRestoring}
            >
              Ya, Restore
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Custom Reset Modal */}
      <Modal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)}
        title="Reset Database"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <p className="text-gray-700 dark:text-white font-semibold">
              <span className="text-red-600 dark:text-red-400">BAHAYA!</span> Ini akan menghapus SEMUA DATA termasuk:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4 text-gray-600 dark:text-gray-300 mt-2">
              <li>Semua user (kecuali superadmin)</li>
              <li>Semua data iuran</li>
              <li>Semua histori transaksi</li>
            </ul>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Tindakan ini TIDAK DAPAT DIBATALKAN!
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetModal(false)}
              className="flex-1"
              disabled={isResetting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetDatabase}
              className="flex-1"
              isLoading={isResetting}
              disabled={isResetting}
            >
              Ya, Reset Database
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}