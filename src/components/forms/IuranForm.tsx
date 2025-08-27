/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan IuranForm, komponen utama bagi pengguna untuk mengirimkan donasi bulanan mereka.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAuth } from '@/hooks/useAuth';
import { useSubmitIuran, useUserSubmissionForMonth } from '@/hooks/useIuranData';
import { getCurrentMonthYearString, formatCurrency, formatNumber, parseCurrency } from '@/lib/utils';
import { Calculator, Check, Edit, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
const iuranSchema = z.object({
    iuran_1: z.number().min(0, 'Nominal tidak boleh negatif'),
    iuran_2: z.number().min(0, 'Nominal tidak boleh negatif'),
    iuran_3: z.number().min(0, 'Nominal tidak boleh negatif'),
    iuran_4: z.number().min(0, 'Nominal tidak boleh negatif'),
    iuran_5: z.number().min(0, 'Nominal tidak boleh negatif'),
});

/* Definisi tipe yang diambil dari skema Zod. */
type IuranFormData = z.infer<typeof iuranSchema>;

/**
 * @function IuranForm
 * @description Form utama bagi pengguna untuk mengirim atau mengedit iuran bulanan mereka.
 * Mengambil data yang ada, menangani status edit/hanya-baca, memvalidasi input, dan menampilkan berbagai pesan umpan balik.
 * @returns {JSX.Element} Komponen form iuran yang dirender.
 */
export function IuranForm() {
    const { user } = useAuth();
    /* State untuk beralih antara mode hanya-baca dan edit jika data sudah ada. */
    const [isEditMode, setIsEditMode] = useState(false);
    /* State untuk menampung nilai string input yang diformat untuk pengguna. */
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    /* State untuk error validasi kustom (misalnya, dari server, batas nilai). */
    const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
    /* State untuk mengontrol visibilitas modal konfirmasi sukses. */
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const currentMonth = getCurrentMonthYearString();

    /* Ambil data iuran yang ada untuk pengguna dan bulan saat ini. */
    const { data: existingSubmission, isLoading: submissionLoading } = useUserSubmissionForMonth(
        user?.id || '',
        currentMonth
    );

    const submitMutation = useSubmitIuran();

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<IuranFormData>({
        resolver: zodResolver(iuranSchema),
        defaultValues: { iuran_1: 0, iuran_2: 0, iuran_3: 0, iuran_4: 0, iuran_5: 0 },
    });

    /* Amati semua nilai form untuk menghitung total secara real-time. */
    const watchedValues = watch();
    const total = Object.values(watchedValues).reduce((sum, val) => sum + (val || 0), 0);

    const hasSubmitted = !!existingSubmission;
    const isFormDisabled = hasSubmitted && !isEditMode;
    const isHighAmount = total >= 500000000; // 500 juta
    const isVeryHighAmount = total >= 1000000000; // 1 miliar

    /* Efek untuk mengisi form saat data iuran yang ada dimuat. */
    useEffect(() => {
        if (existingSubmission) {
            setValue('iuran_1', existingSubmission.iuran_1);
            setValue('iuran_2', existingSubmission.iuran_2);
            setValue('iuran_3', existingSubmission.iuran_3);
            setValue('iuran_4', existingSubmission.iuran_4);
            setValue('iuran_5', existingSubmission.iuran_5);

            setInputValues({
                iuran_1: existingSubmission.iuran_1 > 0 ? formatNumber(existingSubmission.iuran_1) : '',
                iuran_2: existingSubmission.iuran_2 > 0 ? formatNumber(existingSubmission.iuran_2) : '',
                iuran_3: existingSubmission.iuran_3 > 0 ? formatNumber(existingSubmission.iuran_3) : '',
                iuran_4: existingSubmission.iuran_4 > 0 ? formatNumber(existingSubmission.iuran_4) : '',
                iuran_5: existingSubmission.iuran_5 > 0 ? formatNumber(existingSubmission.iuran_5) : '',
            });
            setInputErrors({});
        }
    }, [existingSubmission, setValue]);

    /**
     * @function onSubmit
     * @description Menangani pengiriman form, termasuk validasi batas nilai dan kondisi balapan (race condition).
     * @param {IuranFormData} data - Data form yang telah divalidasi.
     */
    const onSubmit = async (data: IuranFormData) => {
        if (!user) return;

        /* Blokir pengiriman jika ada field yang melebihi 1 miliar. */
        const maxValue = 1000000000;
        const exceedingFields = Object.entries(data).filter(([, value]) => value > maxValue);
        if (exceedingFields.length > 0) {
            const newErrors: Record<string, string> = {};
            exceedingFields.forEach(([key]) => {
                newErrors[key] = `Maksimal 1 Milyar. Hubungi admin untuk nominal lebih besar.`;
            });
            setInputErrors(newErrors);
            return;
        }

        /* Cek kondisi balapan: jika pengguna membuka dua tab dan mengirim dari keduanya. */
        if (!hasSubmitted && !isEditMode) {
            try {
                const { data: currentCheck } = await supabase.from('iuran_submissions').select('*').eq('user_id', user.id).eq('bulan_tahun', currentMonth).single();
                if (currentCheck) {
                    setInputErrors({ general: 'Iuran untuk bulan ini sudah pernah dikirim. Halaman akan dimuat ulang.' });
                    setTimeout(() => window.location.reload(), 2000);
                    return;
                }
            } catch { }
        }

        try {
            /* Validasi akhir data pengguna sebelum mutasi. */
            if (!user?.id || !user?.username || !user?.full_name) {
                setInputErrors({ general: 'Data pengguna tidak lengkap. Silakan logout dan login kembali.' });
                return;
            }

            const submitData = { ...data, bulan_tahun: currentMonth, user_id: user.id, username: user.username, nama_jamaah: user.full_name };
            await submitMutation.mutateAsync(submitData);

            setIsEditMode(false);
            setInputErrors({});
            setShowSuccessModal(true);
        } catch (error: unknown) {
            const message = getErrorMessage(error) || 'Unknown error';
            setInputErrors({ general: `Database error: ${message}. Check database setup.` });
        }
    };

    /**
     * @function handleCurrencyInput
     * @description Menangani input pengguna di field mata uang, mengurai, memvalidasi, dan memformat nilai.
     * @param {keyof IuranFormData} fieldName - Nama field form.
     * @returns {(e: React.ChangeEvent<HTMLInputElement>) => void} Event handler.
     */
    const handleCurrencyInput = (fieldName: keyof IuranFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericValue = parseCurrency(rawValue);

        /* Validasi bahwa nilai tidak melebihi maksimum yang diizinkan. */
        const maxValue = 1000000000;
        if (numericValue > maxValue) {
            setInputErrors(prev => ({ ...prev, [fieldName]: `Maksimal 1 Milyar. Hubungi admin.` }));
            return;
        } else {
            setInputErrors(prev => { const newErrors = { ...prev }; delete newErrors[fieldName]; return newErrors; });
        }

        const formattedValue = numericValue > 0 ? formatNumber(numericValue) : '';
        setInputValues(prev => ({ ...prev, [fieldName]: formattedValue }));
        setValue(fieldName, numericValue, { shouldValidate: true, shouldDirty: true });
    };

    if (submissionLoading) {
        return <Card><CardContent className="p-8 text-center"><p>Memuat data...</p></CardContent></Card>;
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Form Iuran Bulanan</CardTitle>
                    {hasSubmitted && <Badge variant="success" className="flex items-center space-x-1"><Check className="h-3 w-3" /><span>Sudah Melakukan Pembayaran</span></Badge>}
                </div>
                <p className="text-body-small text-gray-600 dark:text-gray-300">{new Date(currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-caption text-gray-700 dark:text-gray-300">Nama Jamaah</label>
                        <div className="mt-2 p-3 glass-input bg-gray-100/50 dark:bg-gray-800/50">{user?.full_name}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((num) => {
                            const fieldName = `iuran_${num}` as keyof IuranFormData;
                            return (
                                <div key={num}>
                                    <label className="text-caption text-gray-700 dark:text-gray-300">Iuran {num}</label>
                                    <div className="relative mt-2">
                                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none"><div className="pl-3 pr-2 flex items-center h-full"><span className="text-base font-bold text-primary-600 dark:text-primary-400">Rp</span><div className="w-px h-6 bg-gray-300 dark:bg-gray-600 ml-2"></div></div></div>
                                        <input type="text" className={`glass-input font-normal text-base w-full pl-12 ${isFormDisabled ? 'bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed' : ''}`} placeholder="0" disabled={isFormDisabled} onChange={handleCurrencyInput(fieldName)} value={inputValues[fieldName] || ''} title={isFormDisabled ? 'Form dinonaktifkan karena iuran bulan ini sudah dikirim' : undefined} />
                                    </div>
                                    {errors[fieldName] && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[fieldName]?.message}</p>}
                                    {inputErrors[fieldName] && <div className="flex items-start space-x-2 mt-1"><AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-600 dark:text-red-400 font-medium">{inputErrors[fieldName]}</p></div>}
                                </div>
                            );
                        })}
                    </div>

                    <Card className="bg-blue-500/20 dark:bg-blue-900/20">
                        <CardContent className="p-4"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" /><span className="font-semibold text-primary-900 dark:text-primary-100">Total Iuran</span></div><span className="text-heading-3 text-primary-900 dark:text-primary-100">{formatCurrency(total)}</span></div></CardContent>
                    </Card>

                    {isHighAmount && (
                        <Card className={`${isVeryHighAmount ? 'bg-red-500/20 dark:bg-red-900/30 border-red-400/60 dark:border-red-800' : 'bg-amber-500/20 dark:bg-amber-900/30 border-amber-400/60 dark:border-amber-800'}`}>
                            <CardContent className="p-4"><div className="flex items-start space-x-3"><AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isVeryHighAmount ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} /><div><h4 className={`font-semibold ${isVeryHighAmount ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>{isVeryHighAmount ? 'Peringatan: Nominal Sangat Besar' : 'Peringatan: Nominal Besar'}</h4><p className={`text-sm ${isVeryHighAmount ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>{isVeryHighAmount ? 'Nominal yang Anda masukkan melebihi 1 Miliar. Sistem akan memblokir submit dan Anda perlu menghubungi admin untuk proses manual.' : 'Nominal yang Anda masukkan cukup besar. Pastikan nominal sudah benar. Untuk nominal di atas 1 Miliar, harap lapor admin.'}</p></div></div></CardContent>
                        </Card>
                    )}

                    {inputErrors.general && (
                        <Card className="bg-red-500/20 dark:bg-red-900/30 border-red-400/60 dark:border-red-800">
                            <CardContent className="p-4"><div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700 dark:text-red-300 font-medium">{inputErrors.general}</p></div></CardContent>
                        </Card>
                    )}

                    <div className="flex space-x-4">
                        {!hasSubmitted && <Button type="submit" className="flex-1" isLoading={submitMutation.isPending} disabled={submitMutation.isPending || total === 0 || Object.keys(inputErrors).length > 0}><Check className="mr-2 h-4 w-4" />Submit Iuran</Button>}
                        {hasSubmitted && !isEditMode && <Button type="button" variant="outline" onClick={() => setIsEditMode(true)} className="flex-1"><Edit className="mr-2 h-4 w-4" />Edit Iuran</Button>}
                        {hasSubmitted && isEditMode && (
                            <>
                                <Button type="button" variant="outline" onClick={() => { setIsEditMode(false); if (existingSubmission) { setValue('iuran_1', existingSubmission.iuran_1); setValue('iuran_2', existingSubmission.iuran_2); setValue('iuran_3', existingSubmission.iuran_3); setValue('iuran_4', existingSubmission.iuran_4); setValue('iuran_5', existingSubmission.iuran_5); setInputValues({ iuran_1: existingSubmission.iuran_1 > 0 ? formatNumber(existingSubmission.iuran_1) : '', iuran_2: existingSubmission.iuran_2 > 0 ? formatNumber(existingSubmission.iuran_2) : '', iuran_3: existingSubmission.iuran_3 > 0 ? formatNumber(existingSubmission.iuran_3) : '', iuran_4: existingSubmission.iuran_4 > 0 ? formatNumber(existingSubmission.iuran_4) : '', iuran_5: existingSubmission.iuran_5 > 0 ? formatNumber(existingSubmission.iuran_5) : '' }); } setInputErrors({}); }} className="flex-1">Batal</Button>
                                <Button type="submit" className="flex-1" isLoading={submitMutation.isPending} disabled={submitMutation.isPending || Object.keys(inputErrors).length > 0}><Check className="mr-2 h-4 w-4" />Update Iuran</Button>
                            </>
                        )}
                    </div>

                    {hasSubmitted && (
                        <Card className="bg-green-500/20 dark:bg-green-900/20 border-green-400/60 dark:border-green-800">
                            <CardContent className="p-4"><div className="flex items-start space-x-3"><Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" /><div><h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Iuran Bulan Ini Sudah Dikirim</h4><p className="text-sm text-green-700 dark:text-green-300">Anda sudah melakukan pembayaran iuran untuk bulan {new Date(currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}. Sesuai kebijakan, setiap jamaah hanya dapat mengirim iuran sekali per bulan.</p><p className="text-sm text-green-700 dark:text-green-300 mt-2">Gunakan tombol &quot;Edit Iuran&quot; jika ingin mengubah nominal yang sudah dikirim.</p></div></div></CardContent>
                        </Card>
                    )}
                </form>
            </CardContent>

            <ConfirmationModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} onConfirm={() => setShowSuccessModal(false)} title="Iuran Berhasil Dikirim!" message={<div className="space-y-2"><p>Terima kasih atas kontribusi Anda untuk bulan {new Date(currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.</p><p className="text-sm font-medium text-green-600 dark:text-green-400">Total: {formatCurrency(total)}</p></div>} confirmText="Tutup" cancelText="" variant="success" />
        </Card>
    );
}