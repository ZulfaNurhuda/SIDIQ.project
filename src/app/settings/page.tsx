/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen SettingsPage, yang memungkinkan pengguna untuk mengelola profil, keamanan, tampilan, dan pengaturan sistem mereka.
 */

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
    Settings, User, Shield, Palette, Bell, Database, Download, Upload, Trash2, Eye, EyeOff, Save, AlertCircle, CheckCircle, Info, Lock, AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Modal } from '@/components/ui/Modal';

/**
 * @function getErrorMessage
 * @description Mengekstrak pesan error string dari tipe error yang tidak diketahui.
 * @param {unknown} err - Objek error.
 * @returns {string | undefined} String pesan error, atau undefined jika tidak ditemukan.
 */
function getErrorMessage(err: unknown): string | undefined {
    if (err && typeof err === 'object' && 'message' in err) {
        const msg = (err as { message?: unknown }).message;
        return typeof msg === 'string' ? msg : undefined;
    }
    return undefined;
}

/* Definisi tipe untuk struktur data backup. */
type BackupUser = {
    id: string; username: string; full_name: string; password_hash?: string; role: string; is_active?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string;
};
type BackupIuran = {
    id: string; user_id: string; username?: string; nama_jamaah: string; bulan_tahun: string; timestamp_submitted?: string; iuran_1: number; iuran_2: number; iuran_3: number; iuran_4: number; iuran_5: number; created_at?: string; updated_at?: string;
};
type BackupFile = {
    data?: { users?: BackupUser[]; iuran_submissions?: BackupIuran[]; };
};

/* Skema Zod untuk memvalidasi data form pembaruan profil. */
const profileSchema = z.object({
    fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
});

/* Skema Zod untuk memvalidasi data form perubahan password. */
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
    newPassword: z.string().min(6, 'Password minimal 6 karakter').regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak sesuai',
    path: ['confirmPassword'],
});

/* Definisi tipe yang diambil dari skema Zod. */
type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * @function SettingsPage
 * @description Komponen halaman untuk mengelola pengaturan pengguna, termasuk informasi profil,
 * perubahan password, pengaturan tampilan, dan (untuk superadmin) operasi database tingkat sistem.
 * @returns {JSX.Element} Halaman pengaturan yang dirender.
 */
export default function SettingsPage() {
    const { user, setUser } = useAuth();
    const updateUserMutation = useUpdateUser();
    /* State untuk mengelola tab aktif. */
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'system'>('profile');
    /* State untuk indikator loading. */
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    /* State untuk visibilitas input password. */
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    /* State untuk visibilitas modal. */
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    /* State untuk loading operasi sistem. */
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    /* State untuk file yang dipilih untuk restore database. */
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    /* State untuk pesan sukses dan error. */
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    /* Instance React Hook Form untuk form profil dan password. */
    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: user?.full_name || '' },
    });
    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '', },
    });

    /**
     * @function onProfileSubmit
     * @description Menangani pengiriman form pembaruan profil.
     * Memperbarui nama lengkap pengguna dan me-refresh status otentikasi.
     * @param {ProfileFormData} data - Data form yang telah divalidasi.
     */
    const onProfileSubmit = async (data: ProfileFormData) => {
        setErrorMessage(''); setSuccessMessage(''); setIsUpdatingProfile(true);
        if (!user) return;
        updateUserMutation.mutate({ id: user.id, full_name: data.fullName }, {
            onSuccess: () => {
                setUser({ ...user, full_name: data.fullName });
                setSuccessMessage('Profile berhasil diupdate!');
                setIsUpdatingProfile(false);
            },
            onError: (error: unknown) => {
                const displayError = getErrorMessage(error) || 'Gagal mengupdate profile';
                setErrorMessage(displayError);
                setIsUpdatingProfile(false);
            }
        });
    };

    /**
     * @function onPasswordSubmit
     * @description Menangani pengiriman form perubahan password.
     * Memverifikasi password saat ini dan kemudian memperbaruinya.
     * @param {PasswordFormData} data - Data form yang telah divalidasi.
     */
    const onPasswordSubmit = async (data: PasswordFormData) => {
        setErrorMessage(''); setSuccessMessage(''); setIsUpdatingPassword(true);
        if (!user) return;
        try {
            const { data: authResult, error: authError } = await supabase.rpc('authenticate_user', { input_username: user.username, input_password: data.currentPassword });
            if (authError || !authResult || authResult.length === 0) {
                setErrorMessage('Password saat ini salah');
                setIsUpdatingPassword(false);
                return;
            }
            const { error: updateError } = await supabase.rpc('update_user_with_password', { p_user_id: user.id, p_username: user.username, p_full_name: user.full_name, p_role: user.role, p_password: data.newPassword });
            if (updateError) {
                throw new Error(updateError.message || 'Gagal mengubah password');
            }
            setSuccessMessage('Password berhasil diubah!');
            setIsUpdatingPassword(false);
            passwordForm.reset();
        } catch (error: unknown) {
            const displayError = getErrorMessage(error) || 'Gagal mengubah password';
            setErrorMessage(displayError);
            setIsUpdatingPassword(false);
        }
    };

    /**
     * @function handleBackupDatabase
     * @description Menangani operasi backup database.
     * Mengambil semua data pengguna dan iuran dan mengunduhnya sebagai file JSON.
     */
    const handleBackupDatabase = async () => {
        setIsBackingUp(true); setErrorMessage(''); setSuccessMessage('');
        try {
            const { data: usersData, error: usersError } = await supabase.from('users').select('*').order('created_at', { ascending: true });
            if (usersError) throw usersError;
            const { data: iuranData, error: iuranError } = await supabase.from('iuran_submissions').select('*').order('created_at', { ascending: true });
            if (iuranError) throw iuranError;
            const backup = { version: '1.0', timestamp: new Date().toISOString(), data: { users: usersData || [], iuran_submissions: iuranData || [] } };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            a.href = url; a.download = `sidiq_backup_${timestamp}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            setSuccessMessage('Backup database berhasil! File telah diunduh.');
            setShowBackupModal(false);
        } catch (error: unknown) {
            const message = getErrorMessage(error) || 'Terjadi kesalahan';
            setErrorMessage(`Gagal backup database: ${message}`);
        } finally {
            setIsBackingUp(false);
        }
    };

    /**
     * @function handleRestoreDatabase
     * @description Menangani operasi restore database.
     * Membaca file backup, menghapus data yang ada (kecuali superadmin), dan menyisipkan data dari backup.
     */
    const handleRestoreDatabase = async () => {
        if (!restoreFile) { setErrorMessage('Pilih file backup terlebih dahulu'); return; }
        setIsRestoring(true); setErrorMessage(''); setSuccessMessage('');
        try {
            const fileContent = await restoreFile.text();
            const backup = JSON.parse(fileContent) as unknown as BackupFile;
            if (!backup.data || !backup.data.users || !backup.data.iuran_submissions) { throw new Error('Format file backup tidak valid'); }
            await supabase.from('iuran_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('users').delete().neq('role', 'superadmin');
            for (const userData of backup.data.users) {
                if (userData.role !== 'superadmin') {
                    await supabase.from('users').insert({ id: userData.id, username: userData.username, full_name: userData.full_name, password_hash: userData.password_hash, role: userData.role, is_active: userData.is_active, deleted_at: userData.deleted_at, created_at: userData.created_at, updated_at: userData.updated_at });
                }
            }
            for (const iuranData of backup.data.iuran_submissions) {
                await supabase.from('iuran_submissions').insert({ id: iuranData.id, user_id: iuranData.user_id, username: iuranData.username, nama_jamaah: iuranData.nama_jamaah, bulan_tahun: iuranData.bulan_tahun, timestamp_submitted: iuranData.timestamp_submitted, iuran_1: iuranData.iuran_1, iuran_2: iuranData.iuran_2, iuran_3: iuranData.iuran_3, iuran_4: iuranData.iuran_4, iuran_5: iuranData.iuran_5, created_at: iuranData.created_at, updated_at: iuranData.updated_at });
            }
            setSuccessMessage('Restore database berhasil! Data telah dipulihkan.');
            setShowRestoreModal(false); setRestoreFile(null);
            setTimeout(() => { window.location.reload(); }, 2000);
        } catch (error: unknown) {
            const message = getErrorMessage(error) || 'Terjadi kesalahan';
            setErrorMessage(`Gagal restore database: ${message}`);
        } finally {
            setIsRestoring(false);
        }
    };

    /**
     * @function handleResetDatabase
     * @description Menangani operasi reset database.
     * Menghapus semua data iuran dan semua pengguna kecuali superadmin.
     */
    const handleResetDatabase = async () => {
        setIsResetting(true); setErrorMessage(''); setSuccessMessage('');
        try {
            await supabase.from('iuran_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('users').delete().neq('role', 'superadmin');
            setSuccessMessage('Database berhasil direset! Semua data kecuali superadmin telah dihapus.');
            setShowResetModal(false);
            setTimeout(() => { window.location.reload(); }, 2000);
        } catch (error: unknown) {
            const message = getErrorMessage(error) || 'Terjadi kesalahan';
            setErrorMessage(`Gagal reset database: ${message}`);
        } finally {
            setIsResetting(false);
        }
    };

    /**
     * @function getRoleBadgeVariant
     * @description Menentukan varian warna untuk badge peran berdasarkan peran pengguna.
     * @param {string} role - Peran pengguna.
     * @returns {'error' | 'warning' | 'success' | 'default'} Varian badge.
     */
    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'superadmin': return 'error';
            case 'admin': return 'warning';
            case 'jamaah': return 'success';
            default: return 'default';
        }
    };

    /* Mendefinisikan tab untuk halaman pengaturan. Tab 'sistem' hanya terlihat oleh superadmin. */
    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Keamanan', icon: Shield },
        { id: 'appearance', label: 'Tampilan', icon: Palette },
        ...(user?.role === 'superadmin' ? [{ id: 'system', label: 'Sistem', icon: Database }] : []),
    ];

    /* Efek untuk mereset tab aktif jika pengguna bukan superadmin dan tab 'sistem' aktif. */
    useEffect(() => {
        if (user?.role !== 'superadmin' && activeTab === 'system') {
            setActiveTab('profile');
        }
    }, [user?.role, activeTab]);

    return (
        <div className="space-y-6">
            <PageTitle title="Pengaturan" description="Kelola pengaturan akun dan sistem" icon={Settings} />

            {/* Pesan Sukses/Error */}
            {successMessage && (<Card className="bg-green-500/20 dark:bg-green-900/20 border-green-400/60 dark:border-green-800"><CardContent className="p-4"><div className="flex items-start space-x-3"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p></div></CardContent></Card>)}
            {errorMessage && (<Card className="bg-red-500/20 dark:bg-red-900/20 border-red-400/60 dark:border-red-800"><CardContent className="p-4"><div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700 dark:text-red-300 font-medium">{errorMessage}</p></div></CardContent></Card>)}

            {/* Navigasi Tab */}
            <Card>
                <CardContent className="p-4">
                    <nav className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'appearance' | 'system')} className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-300/50' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'}`}><Icon className="h-5 w-5" /><span>{tab.label}</span></button>
                            );
                        })}
                    </nav>
                </CardContent>
            </Card>

            {/* Konten */}
            <div>
                {/* Tab Profil */}
                {activeTab === 'profile' && (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><User className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Informasi Profile</span></CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Username</label><div className="mt-1 p-3 glass-input bg-gray-100/50 dark:bg-gray-800/50">{user?.username}</div><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username tidak dapat diubah</p></div>
                                <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Role</label><div className="mt-1"><Badge variant={getRoleBadgeVariant(user?.role || '')}>{user?.role?.toUpperCase()}</Badge></div></div>
                            </div>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                <Input label="Nama Lengkap" {...profileForm.register('fullName')} error={profileForm.formState.errors.fullName?.message} placeholder="Masukkan nama lengkap" />
                                <div className="flex justify-end"><Button type="submit" isLoading={isUpdatingProfile} disabled={isUpdatingProfile}><Save className="mr-2 h-4 w-4" />Simpan Perubahan</Button></div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Tab Keamanan */}
                {activeTab === 'security' && (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Lock className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Keamanan Akun</span></CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Saat Ini</label><div className="relative"><Input type={showCurrentPassword ? 'text' : 'password'} placeholder="Masukkan password saat ini" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} className="pr-10" /><button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label><div className="relative"><Input type={showNewPassword ? 'text' : 'password'} placeholder="Masukkan password baru" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} className="pr-10" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Konfirmasi password baru" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} className="pr-10" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                                </div>
                                <div className="flex justify-end pt-4"><Button type="submit" isLoading={isUpdatingPassword} disabled={isUpdatingPassword}><Lock className="mr-2 h-4 w-4" />Ubah Password</Button></div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Tab Tampilan */}
                {activeTab === 'appearance' && (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Palette className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Pengaturan Tampilan</span></CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div><h3 className="text-lg font-medium text-gray-900 dark:text-white">Tema</h3><p className="text-sm text-gray-600 dark:text-gray-300">Pilih tema tampilan aplikasi</p></div>
                                <ThemeToggle />
                            </div>
                            <div className="border-t border-gray-300/70 dark:border-gray-700 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600"><CardContent className="p-4 text-center"><Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600 dark:text-gray-300">Warna Aksen</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p></CardContent></Card>
                                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600"><CardContent className="p-4 text-center"><Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600 dark:text-gray-300">Notifikasi</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p></CardContent></Card>
                                    <Card className="border-2 border-dashed border-gray-300/70 dark:border-gray-600"><CardContent className="p-4 text-center"><Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600 dark:text-gray-300">Tata Letak</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Segera Hadir</p></CardContent></Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Konten Tab Sistem (Hanya Superadmin) */}
                {activeTab === 'system' && (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Database className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Pengaturan Sistem</span></CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {user?.role === 'superadmin' && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Database</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" onClick={() => setShowBackupModal(true)} disabled={isBackingUp}><Download className="h-6 w-6" /><div className="text-center"><div className="font-semibold">Backup Database</div><div className="text-xs opacity-80">Export semua data</div></div></Button>
                                            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" onClick={() => setShowRestoreModal(true)} disabled={isRestoring}><Upload className="h-6 w-6" /><div className="text-center"><div className="font-semibold">Restore Database</div><div className="text-xs opacity-80">Import data backup</div></div></Button>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-300/70 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Zona Berbahaya</h3>
                                        <Card className="border-red-400/60 dark:border-red-800 bg-red-500/20 dark:bg-red-900/20">
                                            <CardContent className="p-4"><div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /><div className="flex-1"><h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Reset Database</h4><p className="text-sm text-red-700 dark:text-red-300 mb-4">Ini akan menghapus SEMUA data termasuk user dan iuran. Tindakan ini tidak dapat dibatalkan!</p><Button variant="destructive" size="sm" onClick={() => setShowResetModal(true)} disabled={isResetting}><Trash2 className="mr-2 h-4 w-4" />Reset Database</Button></div></div></CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                            {user?.role !== 'superadmin' && (
                                <Card className="border-amber-400/60 dark:border-amber-800 bg-amber-500/20 dark:bg-amber-900/20">
                                    <CardContent className="p-4"><div className="flex items-start space-x-3"><Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><div><h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Akses Terbatas</h4><p className="text-sm text-amber-700 dark:text-amber-300">Pengaturan sistem hanya dapat diakses oleh SUPERADMIN.</p></div></div></CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal Konfirmasi Backup */}
            <ConfirmationModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} onConfirm={handleBackupDatabase} title="Backup Database" message="Apakah Anda yakin ingin membackup database? File backup akan diunduh ke komputer Anda." confirmText="Ya, Backup" isLoading={isBackingUp} variant="info" />

            {/* Modal Restore Kustom */}
            <Modal isOpen={showRestoreModal} onClose={() => { setShowRestoreModal(false); setRestoreFile(null); }} title="Restore Database" size="sm">
                <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4"><div className="flex items-start space-x-3"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-amber-800 dark:text-amber-200"><strong>PERINGATAN:</strong> Restore akan menghapus semua data yang ada (kecuali superadmin) dan menggantinya dengan data dari file backup.</p></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih File Backup</label><input type="file" accept=".json" onChange={(e) => setRestoreFile(e.target.files?.[0] || null)} className="glass-input w-full cursor-pointer file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary-500/20 file:text-primary-900 dark:file:text-primary-100 file:rounded-md file:cursor-pointer hover:file:bg-primary-500/30 file:backdrop-blur-sm file:border file:border-primary-300/50 transition-all duration-300" /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">Hanya file JSON yang diizinkan</p></div>
                    <div className="flex space-x-3 pt-4"><Button type="button" variant="outline" onClick={() => { setShowRestoreModal(false); setRestoreFile(null); }} className="flex-1" disabled={isRestoring}>Batal</Button><Button type="button" variant="warning" onClick={handleRestoreDatabase} className="flex-1" isLoading={isRestoring} disabled={isRestoring}>Ya, Restore</Button></div>
                </div>
            </Modal>

            {/* Modal Reset Kustom */}
            <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Database" size="sm">
                <div className="space-y-4">
                    <div><p className="text-gray-700 dark:text-white font-semibold"><span className="text-red-600 dark:text-red-400">BAHAYA!</span> Ini akan menghapus SEMUA DATA termasuk:</p><ul className="list-disc list-inside text-sm space-y-1 ml-4 text-gray-600 dark:text-gray-300 mt-2"><li>Semua user (kecuali superadmin)</li><li>Semua data iuran</li><li>Semua histori transaksi</li></ul></div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3"><div className="flex items-center space-x-2"><AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" /><p className="text-sm font-semibold text-red-800 dark:text-red-200">Tindakan ini TIDAK DAPAT DIBATALKAN!</p></div></div>
                    <div className="flex space-x-3 pt-4"><Button type="button" variant="outline" onClick={() => setShowResetModal(false)} className="flex-1" disabled={isResetting}>Batal</Button><Button type="button" variant="destructive" onClick={handleResetDatabase} className="flex-1" isLoading={isResetting} disabled={isResetting}>Ya, Reset Database</Button></div>
                </div>
            </Modal>
        </div>
    );
}