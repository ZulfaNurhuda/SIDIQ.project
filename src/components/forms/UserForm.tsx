/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen UserForm, sebuah form modal untuk membuat pengguna baru.
 */

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

/* Skema Zod untuk memvalidasi data form pengguna baru. */
const userSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9._]+$/, 'Username hanya boleh berisi huruf, angka, titik (.), dan underscore (_)'),
    full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
    role: z.enum(['admin', 'jamaah'] as const, { message: 'Role harus dipilih. Silakan pilih Admin atau Jamaah.' }),
    password: z.string().min(6, 'Password minimal 6 karakter').regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
});

/* Definisi tipe yang diambil dari skema Zod. */
type UserFormData = z.infer<typeof userSchema>;

/**
 * @interface UserFormProps
 * @description Mendefinisikan properti untuk komponen UserForm.
 */
interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * @function UserForm
 * @description Form modal untuk membuat pengguna baru (baik 'admin' maupun 'jamaah').
 * Menangani validasi input, konfirmasi password, dan menampilkan pesan sukses atau error.
 * @param {UserFormProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Form pembuatan pengguna yang dirender.
 */
export function UserForm({ isOpen, onClose }: UserFormProps) {
    /* State untuk mengubah visibilitas password. */
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    /* State untuk mengelola pesan sukses dan error. */
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

    /**
     * @function onSubmit
     * @description Menangani pengiriman form, memanggil mutasi pembuatan pengguna.
     * @param {UserFormData} data - Data form yang telah divalidasi.
     */
    const onSubmit = async (data: UserFormData) => {
        setErrorMessage('');
        setSuccessMessage('');

        createUserMutation.mutate({
            username: data.username,
            full_name: data.full_name,
            role: data.role,
            password: data.password,
        }, {
            onSuccess: (result) => {
                /* Backend dapat mengembalikan flag jika pengguna nonaktif yang ada diaktifkan kembali. */
                if (result?.is_reactivated) {
                    setSuccessMessage(`User "${data.username}" berhasil direaktifkan! Data iuran sebelumnya telah tersambung kembali.`);
                } else {
                    setSuccessMessage(`User "${data.username}" berhasil dibuat!`);
                }

                setTimeout(() => {
                    handleClose();
                }, 2000);
            },
            onError: (error: unknown) => {
                const displayError = getErrorMessage(error) || 'Gagal membuat user';
                setErrorMessage(displayError);
            }
        });
    };

    /**
     * @function handleClose
     * @description Mereset semua state dan menutup modal.
     */
    const handleClose = () => {
        reset();
        setErrorMessage('');
        setSuccessMessage('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah User Baru" size="md">
            {/* Tampilan Pesan Sukses dan Error */}
            {successMessage && (
                <Card className="bg-green-500/20 dark:bg-green-900/20 border-green-400/60 dark:border-green-800 mb-4">
                    <CardContent className="p-4"><div className="flex items-start space-x-3"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p></div></CardContent>
                </Card>
            )}
            {errorMessage && (
                <Card className="bg-red-500/20 dark:bg-red-900/20 border-red-400/60 dark:border-red-800 mb-4">
                    <CardContent className="p-4"><div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700 dark:text-red-300 font-medium">{errorMessage}</p></div></CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Username" {...register('username')} error={errors.username?.message} placeholder="Masukkan username" disabled={createUserMutation.isPending} />
                <Input label="Nama Lengkap" {...register('full_name')} error={errors.full_name?.message} placeholder="Masukkan nama lengkap" disabled={createUserMutation.isPending} />

                <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">Role</label>
                    <div className="relative">
                        <select {...register('role')} className="glass-select font-normal text-base w-full pr-10" disabled={createUserMutation.isPending}>
                            <option value="admin">Admin</option>
                            <option value="jamaah">Jamaah</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    {errors.role && <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} className="glass-input font-normal text-base w-full pr-10" placeholder="Masukkan password" disabled={createUserMutation.isPending} {...register('password')} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" disabled={createUserMutation.isPending}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                    {errors.password?.message && <p className="text-sm text-red-600 dark:text-red-400">{errors.password?.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-caption text-gray-700 dark:text-gray-300">Konfirmasi Password</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} className="glass-input font-normal text-base w-full pr-10" placeholder="Konfirmasi password" disabled={createUserMutation.isPending} {...register('confirmPassword')} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" disabled={createUserMutation.isPending}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                    {errors.confirmPassword?.message && <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword?.message}</p>}
                </div>

                <div className="flex space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={createUserMutation.isPending}>Batal</Button>
                    <Button type="submit" className="flex-1" isLoading={createUserMutation.isPending} disabled={createUserMutation.isPending}><UserPlus className="mr-2 h-4 w-4" />Tambah User</Button>
                </div>
            </form>
        </Modal>
    );
}