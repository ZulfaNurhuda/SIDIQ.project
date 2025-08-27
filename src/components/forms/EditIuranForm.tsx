/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen EditIuranForm, sebuah form modal untuk mengedit data iuran.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { Edit, AlertCircle, CheckCircle, Calculator, Shield } from 'lucide-react';
import { formatCurrency, formatNumber, parseCurrency } from '@/lib/utils';
import { useUpdateIuran } from '@/hooks/useIuranData';

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

/* Skema Zod untuk memvalidasi data form iuran. */
const editIuranSchema = z.object({
    iuran_1: z.number().min(0, 'Iuran 1 tidak boleh negatif'),
    iuran_2: z.number().min(0, 'Iuran 2 tidak boleh negatif'),
    iuran_3: z.number().min(0, 'Iuran 3 tidak boleh negatif'),
    iuran_4: z.number().min(0, 'Iuran 4 tidak boleh negatif'),
    iuran_5: z.number().min(0, 'Iuran 5 tidak boleh negatif'),
    total_iuran: z.number().min(0, 'Total iuran tidak boleh negatif'),
});

/* Definisi tipe yang diambil dari skema Zod. */
type EditIuranFormData = z.infer<typeof editIuranSchema>;

/**
 * @interface IuranData
 * @description Mendefinisikan bentuk data iuran awal yang diteruskan ke form.
 */
interface IuranData {
    id: string;
    nama_jamaah: string;
    username?: string;
    user_id: string;
    iuran_1: number;
    iuran_2: number;
    iuran_3: number;
    iuran_4: number;
    iuran_5: number;
    total_iuran: number;
    bulan_tahun: string;
    created_at: string;
}

/**
 * @interface EditIuranFormProps
 * @description Mendefinisikan properti untuk komponen EditIuranForm.
 */
interface EditIuranFormProps {
    isOpen: boolean;
    onClose: () => void;
    iuranData: IuranData | null;
    currentUserId?: string;
    currentUserRole?: string;
}

/**
 * @function EditIuranForm
 * @description Form modal untuk mengedit data iuran yang sudah ada.
 * Termasuk validasi, format mata uang, dan proses konfirmasi dua langkah.
 * @param {EditIuranFormProps} props - Properti untuk komponen.
 * @returns {JSX.Element | null} Komponen form yang dirender atau null jika tidak ada data yang diberikan.
 */
export function EditIuranForm({ isOpen, onClose, iuranData, currentUserId, currentUserRole }: EditIuranFormProps) {
    /* State untuk mengelola pesan sukses dan error. */
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    /* State untuk proses konfirmasi dua langkah. */
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingData, setPendingData] = useState<EditIuranFormData | null>(null);
    /* State untuk menampung nilai string input yang diformat untuk pengguna. */
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const updateIuranMutation = useUpdateIuran();

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<EditIuranFormData>({
        resolver: zodResolver(editIuranSchema),
    });

    /* Amati semua field iuran untuk menghitung total secara otomatis. */
    const watchedValues = watch(['iuran_1', 'iuran_2', 'iuran_3', 'iuran_4', 'iuran_5']);

    /* Efek untuk menghitung total secara otomatis setiap kali salah satu field iuran berubah. */
    useEffect(() => {
        if (watchedValues.every(val => typeof val === 'number')) {
            const total = watchedValues.reduce((sum, val) => sum + (val || 0), 0);
            setValue('total_iuran', total);
        }
    }, [watchedValues, setValue]);

    /* Efek untuk mengisi form dengan data saat modal dibuka atau data berubah. */
    useEffect(() => {
        if (iuranData && isOpen) {
            setValue('iuran_1', iuranData.iuran_1);
            setValue('iuran_2', iuranData.iuran_2);
            setValue('iuran_3', iuranData.iuran_3);
            setValue('iuran_4', iuranData.iuran_4);
            setValue('iuran_5', iuranData.iuran_5);
            setValue('total_iuran', iuranData.total_iuran);

            /* Atur nilai tampilan dengan pemisah ribuan. */
            setInputValues({
                iuran_1: iuranData.iuran_1 > 0 ? formatNumber(iuranData.iuran_1) : '',
                iuran_2: iuranData.iuran_2 > 0 ? formatNumber(iuranData.iuran_2) : '',
                iuran_3: iuranData.iuran_3 > 0 ? formatNumber(iuranData.iuran_3) : '',
                iuran_4: iuranData.iuran_4 > 0 ? formatNumber(iuranData.iuran_4) : '',
                iuran_5: iuranData.iuran_5 > 0 ? formatNumber(iuranData.iuran_5) : '',
            });
        }
    }, [iuranData, isOpen, setValue]);

    /**
     * @function onSubmit
     * @description Menangani pengiriman form. Menerapkan konfirmasi dua langkah.
     * Klik pertama menampilkan pesan konfirmasi; klik kedua mengirimkan data.
     * @param {EditIuranFormData} data - Data form yang telah divalidasi.
     */
    const onSubmit = (data: EditIuranFormData) => {
        if (!iuranData) return;

        if (!showConfirmation) {
            setPendingData(data);
            setShowConfirmation(true);
            return;
        }

        handleConfirmUpdate();
    };

    /**
     * @function handleConfirmUpdate
     * @description Menjalankan mutasi data aktual setelah konfirmasi.
     */
    const handleConfirmUpdate = async () => {
        if (!iuranData || !pendingData) {
            setErrorMessage('Data iuran atau perubahan tidak valid. Silakan coba lagi.');
            return;
        }

        /* Validasi tambahan untuk memastikan ID adalah UUID yang valid sebelum mutasi. */
        if (!iuranData.id || typeof iuranData.id !== 'string' || iuranData.id.trim() === '' || iuranData.id === 'undefined') {
            setErrorMessage('ID iuran tidak valid. Data mungkin belum dimuat dengan benar. Silakan tutup modal dan coba lagi.');
            return;
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(iuranData.id.trim())) {
            setErrorMessage('Format ID iuran tidak valid. Silakan refresh halaman dan coba lagi.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        updateIuranMutation.mutate({
            id: iuranData.id.trim(),
            ...pendingData,
        }, {
            onSuccess: () => {
                setSuccessMessage(`Iuran "${iuranData.nama_jamaah}" berhasil diupdate!`);
                setShowConfirmation(false);
                setPendingData(null);

                setTimeout(() => {
                    handleClose();
                }, 2000);
            },
            onError: (error: unknown) => {
                const displayError = getErrorMessage(error) || 'Gagal mengupdate iuran';
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
        setShowConfirmation(false);
        setPendingData(null);
        onClose();
    };

    /**
     * @function handleCancelConfirmation
     * @description Membatalkan langkah konfirmasi dan kembali ke mode edit.
     */
    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
        setPendingData(null);
    };

    /**
     * @function handleCurrencyInput
     * @description Menangani input pengguna di field mata uang, mengurai nilai numerik dan memformat nilai tampilan.
     * @param {keyof EditIuranFormData} fieldName - Nama field form yang diubah.
     * @returns {(e: React.ChangeEvent<HTMLInputElement>) => void} Event handler.
     */
    const handleCurrencyInput = (fieldName: keyof EditIuranFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericValue = parseCurrency(rawValue);
        const formattedValue = numericValue > 0 ? formatNumber(numericValue) : '';

        setInputValues(prev => ({ ...prev, [fieldName]: formattedValue }));
        setValue(fieldName, numericValue, { shouldValidate: true, shouldDirty: true });
    };

    if (!iuranData) return null;

    /* Tentukan apakah pengguna saat ini memiliki izin untuk mengedit data. */
    const canEdit = currentUserRole === 'admin' || currentUserRole === 'superadmin' ||
        (!currentUserId || iuranData.user_id === currentUserId);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Data Iuran" size="md">
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
            {!canEdit && (
                <Card className="bg-amber-500/20 dark:bg-amber-900/20 border-amber-400/60 dark:border-amber-800 mb-4">
                    <CardContent className="p-4"><div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Anda tidak memiliki akses untuk mengedit data iuran ini</p></div></CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Tampilkan info statis tentang data yang sedang diedit. */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                    <div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Jamaah</p><p className="text-base font-semibold text-gray-900 dark:text-white">{iuranData.nama_jamaah}</p></div>
                    <div><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bulan</p><p className="text-base font-semibold text-gray-900 dark:text-white">{new Date(iuranData.bulan_tahun).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>
                </div>

                {/* Hasilkan 5 field input iuran secara dinamis. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const fieldName = `iuran_${num}` as keyof EditIuranFormData;
                        return (
                            <div key={num}>
                                <label className="text-caption text-gray-700 dark:text-gray-300">Iuran {num}</label>
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none"><div className="pl-3 pr-2 flex items-center h-full"><span className="text-base font-bold text-primary-600 dark:text-primary-400">Rp</span><div className="w-px h-6 bg-gray-300 dark:bg-gray-600 ml-2"></div></div></div>
                                    <input
                                        type="text"
                                        className={`glass-input font-normal text-base w-full pl-12 ${(!canEdit || showConfirmation) ? 'bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed' : ''}`}
                                        placeholder="0"
                                        disabled={!canEdit || showConfirmation}
                                        onChange={handleCurrencyInput(fieldName)}
                                        value={inputValues[fieldName] || ''}
                                    />
                                </div>
                                {errors[fieldName] && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[fieldName]?.message}</p>}
                            </div>
                        );
                    })}
                </div>

                {/* Tampilkan total yang dihitung otomatis. */}
                <Card className="bg-blue-500/20 dark:bg-blue-900/20">
                    <CardContent className="p-4"><div className="space-y-3"><div className="flex items-center space-x-2"><Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" /><span className="font-semibold text-primary-900 dark:text-primary-100">Total Iuran</span></div><div className="text-center"><span className="text-heading-3 text-primary-900 dark:text-primary-100 font-bold">{formatCurrency(watchedValues.reduce((sum, val) => sum + (val || 0), 0))}</span><p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Dihitung otomatis dari iuran 1-5</p></div></div></CardContent>
                </Card>

                {/* Tampilkan pesan konfirmasi inline. */}
                {showConfirmation && (
                    <Card className="bg-amber-500/20 dark:bg-amber-900/20 border-amber-400/60 dark:border-amber-800 mb-4">
                        <CardContent className="p-4"><div className="flex items-start space-x-3"><Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><div className="flex-1"><p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">Konfirmasi Update Iuran</p><p className="text-sm text-amber-700 dark:text-amber-300">Anda akan mengupdate data iuran <strong>&quot;{iuranData.nama_jamaah}&quot;</strong> untuk bulan <strong>{new Date(iuranData.bulan_tahun).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</strong>. Klik &quot;Konfirmasi&quot; untuk melanjutkan atau &quot;Batal&quot; untuk membatalkan.</p></div></div></CardContent>
                    </Card>
                )}

                {/* Tombol aksi form. */}
                <div className="flex space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={showConfirmation ? handleCancelConfirmation : handleClose} className="flex-1">Batal</Button>
                    {canEdit && (
                        <Button type="submit" className="flex-1" isLoading={updateIuranMutation.isPending} disabled={updateIuranMutation.isPending} variant={showConfirmation ? "warning" : "default"}>
                            {showConfirmation ? (<><Shield className="mr-2 h-4 w-4" />Konfirmasi</>) : (<><Edit className="mr-2 h-4 w-4" />Update Iuran</>)}
                        </Button>
                    )}
                </div>
            </form>
        </Modal>
    );
}