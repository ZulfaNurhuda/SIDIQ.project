/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen UsersPage untuk administrator mengelola akun pengguna.
 */

'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { UserForm } from '@/components/forms/UserForm';
import { EditUserForm } from '@/components/forms/EditUserForm';
import { PageTitle } from '@/components/ui/PageTitle';
import { User } from '@/types';
import { Users, UserPlus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/**
 * @function UsersPage
 * @description Komponen halaman untuk administrator melihat, menambah, mengedit, dan menghapus akun pengguna secara lunak.
 * Termasuk kontrol akses berbasis peran untuk mengedit dan menghapus pengguna.
 * @returns {JSX.Element} Halaman manajemen pengguna yang dirender.
 */
export default function UsersPage() {
    /* State untuk mengontrol visibilitas modal form tambah pengguna. */
    const [showUserForm, setShowUserForm] = useState(false);
    /* State untuk mengelola modal konfirmasi hapus. */
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        userId: string;
        userName: string;
    }>({ isOpen: false, userId: '', userName: '' });
    /* State untuk menampung data pengguna untuk modal form edit pengguna. */
    const [editUser, setEditUser] = useState<User | null>(null);
    /* State untuk menampilkan pesan error umum. */
    const [errorMessage, setErrorMessage] = useState('');

    const { user: currentUser } = useAuth();
    const { data: users, isLoading } = useUsers();
    const deleteUserMutation = useDeleteUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /**
     * @function handleDeleteUser
     * @description Memulai proses penghapusan pengguna dengan membuka modal konfirmasi.
     * @param {string} userId - ID pengguna yang akan dihapus.
     * @param {string} userName - Username pengguna yang akan dihapus.
     */
    const handleDeleteUser = (userId: string, userName: string) => {
        setDeleteConfirmation({
            isOpen: true,
            userId,
            userName
        });
        setErrorMessage(''); // Hapus error sebelumnya
    };

    /**
     * @function confirmDeleteUser
     * @description Mengkonfirmasi dan mengeksekusi penghapusan pengguna.
     * Menggunakan hook `deleteUserMutation` dan menangani umpan balik sukses/error.
     */
    const confirmDeleteUser = async () => {
        try {
            await deleteUserMutation.mutateAsync(deleteConfirmation.userId);
            setDeleteConfirmation({ isOpen: false, userId: '', userName: '' });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus user. Silakan coba lagi.';
            setErrorMessage(message);
            // Jangan tutup modal agar pengguna dapat melihat error
        }
    };

    /**
     * @function cancelDeleteUser
     * @description Membatalkan operasi hapus dan menutup modal konfirmasi.
     */
    const cancelDeleteUser = () => {
        setDeleteConfirmation({ isOpen: false, userId: '', userName: '' });
        setErrorMessage('');
    };

    /**
     * @function closeEditUser
     * @description Menutup modal edit pengguna dan menghapus pesan error apa pun.
     */
    const closeEditUser = () => {
        setEditUser(null);
        setErrorMessage('');
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

    /**
     * @function canDeleteUser
     * @description Menentukan apakah pengguna saat ini memiliki izin untuk menghapus pengguna tertentu.
     * Superadmin tidak dapat dihapus oleh siapapun. Pengguna tidak dapat menghapus diri sendiri. Admin tidak dapat menghapus admin lain.
     * @param {User} user - Pengguna yang akan diperiksa izin penghapusannya.
     * @returns {boolean} True jika pengguna dapat dihapus, false jika tidak.
     */
    const canDeleteUser = (user: User) => {
        if (user.role === 'superadmin') return false;
        if (user.id === currentUser?.id) return false;
        if (currentUser?.role === 'admin' && user.role === 'admin') return false;
        return true;
    };

    /**
     * @function canEditUser
     * @description Menentukan apakah pengguna saat ini memiliki izin untuk mengedit pengguna tertentu.
     * Superadmin dapat mengedit semua pengguna. Admin hanya dapat mengedit pengguna 'jamaah'.
     * @param {User} user - Pengguna yang akan diperiksa izin pengeditannya.
     * @returns {boolean} True jika pengguna dapat diedit, false jika tidak.
     */
    const canEditUser = (user: User) => {
        if (currentUser?.role === 'superadmin') return true;
        if (currentUser?.role === 'admin') {
            if (user.role === 'superadmin' || user.role === 'admin') return false;
            return true;
        }
        return false;
    };

    /**
     * @function handleEditUser
     * @description Membuka modal edit pengguna dengan data pengguna yang dipilih.
     * @param {User} user - Objek pengguna yang akan diedit.
     */
    const handleEditUser = (user: User) => {
        setEditUser(user);
        setErrorMessage(''); // Hapus error sebelumnya
    };

    /* Filter pengguna berdasarkan peran pengguna saat ini untuk tujuan tampilan. */
    const filteredUsers = users?.filter(() => {
        if (currentUser?.role === 'superadmin') return true;
        if (currentUser?.role === 'admin') return true;
        return false;
    }) || [];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Manajemen User"
                description="Kelola user admin dan jamaah"
                icon={Users}
            />

            {/* Kartu Statistik Pengguna */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pengguna</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{users?.length || 0}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><div className="h-8 w-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"><span className="text-red-600 dark:text-red-400 font-bold text-sm">SA</span></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">SUPERADMIN</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{users?.filter(u => u.role === 'superadmin').length || 0}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center"><span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">A</span></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">ADMIN</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{users?.filter(u => u.role === 'admin').length || 0}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"><span className="text-green-600 dark:text-green-400 font-bold text-sm">J</span></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">JAMAAH</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{users?.filter(u => u.role === 'jamaah').length || 0}</p></div></div></CardContent></Card>
            </div>

            {/* Tabel Daftar Pengguna */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Users className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
                            <span className="text-blue-900 dark:text-white">Daftar Pengguna</span>
                        </CardTitle>
                        <Button onClick={() => setShowUserForm(true)}><UserPlus className="mr-2 h-4 w-4" />Tambah Pengguna</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <p className="text-center py-8 text-gray-600 dark:text-gray-300">
                            Belum ada user yang terdaftar
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-400/80 dark:border-gray-700"><th className="text-left p-4">Username</th><th className="text-left p-4">Nama Lengkap</th><th className="text-left p-4">Role</th><th className="text-left p-4">Dibuat</th><th className="text-right p-4">Aksi</th></tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-300/65 dark:border-gray-800">
                                            <td className="p-4">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {user.username}
                                                </span>
                                                {user.id === currentUser?.id && (
                                                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                                        (Anda)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">
                                                {user.full_name}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">
                                                {formatDate(new Date(user.created_at))}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {canEditUser(user) ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                            title="Edit user"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={true}
                                                            title={
                                                                user.role === 'superadmin'
                                                                    ? 'SUPERADMIN hanya bisa diedit oleh SUPERADMIN lain'
                                                                    : user.role === 'admin'
                                                                        ? 'ADMIN tidak dapat mengedit ADMIN lain'
                                                                        : 'Anda tidak memiliki permission untuk mengedit user ini'
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canDeleteUser(user) ? (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                                            disabled={deleteUserMutation.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={true}
                                                            title={
                                                                user.role === 'superadmin'
                                                                    ? 'SUPERADMIN tidak dapat dihapus'
                                                                    : user.id === currentUser?.id
                                                                        ? 'Tidak dapat menghapus akun sendiri'
                                                                        : 'Anda tidak memiliki permission untuk menghapus user ini'
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <UserForm
                isOpen={showUserForm}
                onClose={() => setShowUserForm(false)}
            />

            <EditUserForm
                isOpen={!!editUser}
                onClose={closeEditUser}
                user={editUser}
            />

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDeleteUser}
                onConfirm={confirmDeleteUser}
                title="Konfirmasi Hapus User"
                message={`Apakah Anda yakin ingin menghapus user "${deleteConfirmation.userName}"? User akan di-soft delete dan data iuran akan disembunyikan hingga username yang sama ditambahkan kembali.`}
                confirmText="Hapus User"
                cancelText="Batal"
                isLoading={deleteUserMutation.isPending}
                variant="danger"
            />

            {/* Pesan Error (posisi tetap) */}
            {errorMessage && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Card className="bg-red-500/20 dark:bg-red-900/20 border-red-400/60 dark:border-red-800">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                        {errorMessage}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setErrorMessage('')}
                                        className="mt-2"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}