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

function getErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    return typeof msg === 'string' ? msg : undefined;
  }
  return undefined;
}
const iuranSchema = z.object({
  iuran_1: z.number().min(0, 'Nominal tidak boleh negatif'),
  iuran_2: z.number().min(0, 'Nominal tidak boleh negatif'),
  iuran_3: z.number().min(0, 'Nominal tidak boleh negatif'),
  iuran_4: z.number().min(0, 'Nominal tidak boleh negatif'),
  iuran_5: z.number().min(0, 'Nominal tidak boleh negatif'),
});

type IuranFormData = z.infer<typeof iuranSchema>;

export function IuranForm() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const currentMonth = getCurrentMonthYearString();
  
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
    defaultValues: {
      iuran_1: 0,
      iuran_2: 0,
      iuran_3: 0,
      iuran_4: 0,
      iuran_5: 0,
    },
  });

  const watchedValues = watch();
  const total = Object.values(watchedValues).reduce((sum, val) => sum + (val || 0), 0);
  
  const hasSubmitted = !!existingSubmission;
  const isFormDisabled = hasSubmitted && !isEditMode;
  const isHighAmount = total >= 500000000; // 500 juta untuk warning
  const isVeryHighAmount = total >= 1000000000; // 1 miliar untuk warning kuat

  useEffect(() => {
    if (existingSubmission) {
      setValue('iuran_1', existingSubmission.iuran_1);
      setValue('iuran_2', existingSubmission.iuran_2);
      setValue('iuran_3', existingSubmission.iuran_3);
      setValue('iuran_4', existingSubmission.iuran_4);
      setValue('iuran_5', existingSubmission.iuran_5);
      
      // Update input display values with thousand separators
      setInputValues({
        iuran_1: existingSubmission.iuran_1 > 0 ? formatNumber(existingSubmission.iuran_1) : '',
        iuran_2: existingSubmission.iuran_2 > 0 ? formatNumber(existingSubmission.iuran_2) : '',
        iuran_3: existingSubmission.iuran_3 > 0 ? formatNumber(existingSubmission.iuran_3) : '',
        iuran_4: existingSubmission.iuran_4 > 0 ? formatNumber(existingSubmission.iuran_4) : '',
        iuran_5: existingSubmission.iuran_5 > 0 ? formatNumber(existingSubmission.iuran_5) : '',
      });
      
      // Clear any input errors when loading existing data
      setInputErrors({});
    }
  }, [existingSubmission, setValue]);

  const onSubmit = async (data: IuranFormData) => {
    if (!user) return;

    // Check for values exceeding 1 billion before submit
    const maxValue = 1000000000; // 1 Miliar
    const exceedingFields = Object.entries(data).filter(([, value]) => value > maxValue);
    
    if (exceedingFields.length > 0) {
      // Set error messages for exceeding fields
      const newErrors: Record<string, string> = {};
      exceedingFields.forEach(([key]) => {
        newErrors[key] = `Maksimal 1 Milyar (${maxValue.toLocaleString('id-ID')}). Hubungi admin untuk nominal lebih besar.`;
      });
      setInputErrors(newErrors);
      return;
    }

    // Additional check: prevent duplicate submissions for new entries
    if (!hasSubmitted && !isEditMode) {
      // This is a new submission, check once more if someone already submitted
      // (in case of race conditions or multiple tabs)
      try {
        const { data: currentCheck } = await supabase
          .from('iuran_submissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('bulan_tahun', currentMonth)
          .single();
        
        if (currentCheck) {
          setInputErrors({
            general: 'Iuran untuk bulan ini sudah pernah dikirim. Halaman akan dimuat ulang untuk menampilkan data terbaru.'
          });
          // Refresh the page to show latest data
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
      } catch {
      }
    }

    try {
      // Validate user data before submit
      if (!user?.id) {
        setInputErrors({
          general: 'User ID tidak valid. Silakan logout dan login kembali.'
        });
        return;
      }
      
      if (!user?.username) {
        setInputErrors({
          general: 'Username tidak valid. Silakan logout dan login kembali.'
        });
        return;
      }
      
      if (!user?.full_name) {
        setInputErrors({
          general: 'Nama lengkap tidak valid. Silakan logout dan login kembali.'
        });
        return;
      }
      
      const submitData = {
        ...data,
        bulan_tahun: currentMonth,
        user_id: user.id,
        username: user.username, // Store username for reconnection
        nama_jamaah: user.full_name,
      };
      
      await submitMutation.mutateAsync(submitData);

      setIsEditMode(false);
      // Clear any input errors on successful submit
      setInputErrors({});
      // Show success modal
      setShowSuccessModal(true);
      // Reset form will happen automatically via refetch
    } catch (error: unknown) {
      const message = getErrorMessage(error) || 'Unknown error';
      setInputErrors({ 
        general: `Database error: ${message}. Check database setup.` 
      });
    }
  };

  const handleCurrencyInput = (fieldName: keyof IuranFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Parse numeric value
    const numericValue = parseCurrency(rawValue);
    
    // Check if exceeds 1 billion (1 Milyar)
    const maxValue = 1000000000;
    if (numericValue > maxValue) {
      // Set error message instead of alert
      setInputErrors(prev => ({
        ...prev,
        [fieldName]: `Maksimal 1 Milyar (${maxValue.toLocaleString('id-ID')}). Hubungi admin untuk nominal lebih besar.`
      }));
      return; // Don't update the input
    } else {
      // Clear error if value is valid
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    // Format with thousand separators for display
    const formattedValue = numericValue > 0 ? formatNumber(numericValue) : '';
    
    // Store formatted input value for display
    setInputValues(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
    
    // Update form value
    setValue(fieldName, numericValue, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };

  if (submissionLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Memuat data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Iuran Bulanan</CardTitle>
          {hasSubmitted && (
            <Badge variant="success" className="flex items-center space-x-1">
              <Check className="h-3 w-3" />
              <span>Sudah Melakukan Pembayaran</span>
            </Badge>
          )}
        </div>
        <p className="text-body-small text-gray-600 dark:text-gray-300">
          {new Date(currentMonth).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-caption text-gray-700 dark:text-gray-300">
              Nama Jamaah
            </label>
            <div className="mt-2 p-3 glass-input bg-gray-100/50 dark:bg-gray-800/50">
              {user?.full_name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((num) => {
              const fieldName = `iuran_${num}` as keyof IuranFormData;
              return (
                <div key={num}>
                  <label className="text-caption text-gray-700 dark:text-gray-300">
                    Iuran {num}
                  </label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <div className="pl-3 pr-2 flex items-center h-full">
                        <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                          Rp
                        </span>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 ml-2"></div>
                      </div>
                    </div>
                    <input
                      type="text"
                      className={`glass-input font-normal text-base w-full pl-12 ${
                        isFormDisabled ? 'bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed' : ''
                      }`}
                      placeholder="0"
                      disabled={isFormDisabled}
                      onChange={handleCurrencyInput(fieldName)}
                      value={inputValues[fieldName] || ''}
                      title={isFormDisabled ? 'Form dinonaktifkan karena iuran bulan ini sudah dikirim' : undefined}
                    />
                  </div>
                  {/* Form validation errors */}
                  {errors[fieldName] && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors[fieldName]?.message}
                    </p>
                  )}
                  
                  {/* Input validation errors (custom) */}
                  {inputErrors[fieldName] && (
                    <div className="flex items-start space-x-2 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {inputErrors[fieldName]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Card */}
          <Card className="bg-blue-500/20 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold text-primary-900 dark:text-primary-100">
                    Total Iuran
                  </span>
                </div>
                <span className="text-heading-3 text-primary-900 dark:text-primary-100">
                  {formatCurrency(total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* High Amount Warning */}
          {isHighAmount && (
            <Card className={`${isVeryHighAmount ? 'bg-red-500/20 dark:bg-red-900/30 border-red-400/60 dark:border-red-800' : 'bg-amber-500/20 dark:bg-amber-900/30 border-amber-400/60 dark:border-amber-800'}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isVeryHighAmount ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <div>
                    <h4 className={`font-semibold ${isVeryHighAmount ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
                      {isVeryHighAmount ? 'Peringatan: Nominal Sangat Besar' : 'Peringatan: Nominal Besar'}
                    </h4>
                    <p className={`text-sm ${isVeryHighAmount ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {isVeryHighAmount 
                        ? 'Nominal yang Anda masukkan melebihi 1 Miliar. Sistem akan memblokir submit dan Anda perlu menghubungi admin untuk proses manual yang lebih aman.'
                        : 'Nominal yang Anda masukkan cukup besar. Pastikan nominal sudah benar sebelum submit. Untuk nominal di atas 1 Miliar, harap laporkan langsung kepada admin.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Error Message */}
          {inputErrors.general && (
            <Card className="bg-red-500/20 dark:bg-red-900/30 border-red-400/60 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {inputErrors.general}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!hasSubmitted && (
              <Button
                type="submit"
                className="flex-1"
                isLoading={submitMutation.isPending}
                disabled={submitMutation.isPending || total === 0 || Object.keys(inputErrors).length > 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Submit Iuran
              </Button>
            )}

            {hasSubmitted && !isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditMode(true)}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Iuran
              </Button>
            )}

            {hasSubmitted && isEditMode && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    // Reset to original values when canceling edit
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
                    }
                    setInputErrors({});
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={submitMutation.isPending}
                  disabled={submitMutation.isPending || Object.keys(inputErrors).length > 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Update Iuran
                </Button>
              </>
            )}
          </div>

          {hasSubmitted && (
            <Card className="bg-green-500/20 dark:bg-green-900/20 border-green-400/60 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                      Iuran Bulan Ini Sudah Dikirim
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Anda sudah melakukan pembayaran iuran untuk bulan {new Date(currentMonth).toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric'
                      })}. Sesuai kebijakan, setiap jamaah hanya dapat mengirim iuran sekali per bulan.
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      Gunakan tombol &quot;Edit Iuran&quot; jika ingin mengubah nominal yang sudah dikirim.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </CardContent>
      
      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Iuran Berhasil Dikirim!"
        message={
          <div className="space-y-2">
            <p>
              Terima kasih atas kontribusi Anda untuk bulan {new Date(currentMonth).toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric'
              })}.
            </p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Total: {formatCurrency(total)}
            </p>
          </div>
        }
        confirmText="Tutup"
        cancelText=""
        variant="success"
      />
    </Card>
  );
}
