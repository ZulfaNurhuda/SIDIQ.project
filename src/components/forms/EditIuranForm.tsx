'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Edit, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { formatCurrency, formatNumber, parseCurrency } from '@/lib/utils';
import { useUpdateIuran } from '@/hooks/useIuranData';

const editIuranSchema = z.object({
  iuran_1: z.number().min(0, 'Iuran 1 tidak boleh negatif'),
  iuran_2: z.number().min(0, 'Iuran 2 tidak boleh negatif'),
  iuran_3: z.number().min(0, 'Iuran 3 tidak boleh negatif'),
  iuran_4: z.number().min(0, 'Iuran 4 tidak boleh negatif'),
  iuran_5: z.number().min(0, 'Iuran 5 tidak boleh negatif'),
  total_iuran: z.number().min(0, 'Total iuran tidak boleh negatif'),
});

type EditIuranFormData = z.infer<typeof editIuranSchema>;

interface IuranData {
  id: string;
  nama_jamaah: string;
  username: string;
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

interface EditIuranFormProps {
  isOpen: boolean;
  onClose: () => void;
  iuranData: IuranData | null;
  currentUserId?: string;
  currentUserRole?: string;
}

export function EditIuranForm({ isOpen, onClose, iuranData, currentUserId, currentUserRole }: EditIuranFormProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<EditIuranFormData | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const updateIuranMutation = useUpdateIuran();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditIuranFormData>({
    resolver: zodResolver(editIuranSchema),
  });

  // Watch all iuran values for auto calculation
  const watchedValues = watch(['iuran_1', 'iuran_2', 'iuran_3', 'iuran_4', 'iuran_5']);

  // Auto calculate total when iuran values change
  useEffect(() => {
    if (watchedValues.every(val => typeof val === 'number')) {
      const total = watchedValues.reduce((sum, val) => sum + (val || 0), 0);
      setValue('total_iuran', total);
    }
  }, [watchedValues, setValue]);

  // Populate form when iuranData changes
  useEffect(() => {
    if (iuranData && isOpen) {
      setValue('iuran_1', iuranData.iuran_1);
      setValue('iuran_2', iuranData.iuran_2);
      setValue('iuran_3', iuranData.iuran_3);
      setValue('iuran_4', iuranData.iuran_4);
      setValue('iuran_5', iuranData.iuran_5);
      setValue('total_iuran', iuranData.total_iuran);
      
      // Update input display values with thousand separators
      setInputValues({
        iuran_1: iuranData.iuran_1 > 0 ? formatNumber(iuranData.iuran_1) : '',
        iuran_2: iuranData.iuran_2 > 0 ? formatNumber(iuranData.iuran_2) : '',
        iuran_3: iuranData.iuran_3 > 0 ? formatNumber(iuranData.iuran_3) : '',
        iuran_4: iuranData.iuran_4 > 0 ? formatNumber(iuranData.iuran_4) : '',
        iuran_5: iuranData.iuran_5 > 0 ? formatNumber(iuranData.iuran_5) : '',
      });
    }
  }, [iuranData, isOpen, setValue]);

  const onSubmit = (data: EditIuranFormData) => {
    if (!iuranData) return;
    
    // Show confirmation dialog
    setPendingData(data);
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!iuranData || !pendingData) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    setShowConfirmation(false);
    
    updateIuranMutation.mutate({
      id: iuranData.id,
      ...pendingData,
    }, {
      onSuccess: () => {
        setSuccessMessage(`Iuran "${iuranData.nama_jamaah}" berhasil diupdate!`);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          reset();
          setSuccessMessage('');
          onClose();
        }, 2000);
      },
      onError: (error: any) => {
        console.error('Error updating iuran:', error);
        
        // Enhanced error handling for better debugging
        let displayError = 'Gagal mengupdate iuran';
        
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

  const handleCurrencyInput = (fieldName: keyof EditIuranFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Parse numeric value
    const numericValue = parseCurrency(rawValue);
    
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

  if (!iuranData) return null;

  // Check if user can edit this iuran
  // Admin/Superadmin can edit all iuran, Jamaah can only edit their own
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'superadmin' || 
                  (!currentUserId || iuranData.user_id === currentUserId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Data Iuran" size="md">
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

      {/* Permission Check */}
      {!canEdit && (
        <Card className="bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Anda tidak memiliki akses untuk mengedit data iuran ini
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Iuran Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Jamaah</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {iuranData.nama_jamaah}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bulan</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {new Date(iuranData.bulan_tahun).toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Iuran Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((num) => {
            const fieldName = `iuran_${num}` as keyof EditIuranFormData;
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
                      !canEdit ? 'bg-gray-100/70 dark:bg-gray-800/70 cursor-not-allowed' : ''
                    }`}
                    placeholder="0"
                    disabled={!canEdit}
                    onChange={handleCurrencyInput(fieldName)}
                    value={inputValues[fieldName] || ''}
                  />
                </div>
                {errors[fieldName] && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors[fieldName]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Calculation Card */}
        <Card className="bg-primary-50/50 dark:bg-primary-900/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-primary-900 dark:text-primary-100">
                  Total Iuran
                </span>
              </div>
              
              <div className="text-center">
                <span className="text-heading-3 text-primary-900 dark:text-primary-100 font-bold">
                  {formatCurrency(watchedValues.reduce((sum, val) => sum + (val || 0), 0))}
                </span>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Dihitung otomatis dari iuran 1-5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Batal
          </Button>
          {canEdit && (
            <Button
              type="submit"
              className="flex-1"
              isLoading={updateIuranMutation.isPending}
              disabled={updateIuranMutation.isPending}
            >
              <Edit className="mr-2 h-4 w-4" />
              Update Iuran
            </Button>
          )}
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmUpdate}
        title="Konfirmasi Update Iuran"
        message={`Apakah Anda yakin ingin mengupdate data iuran "${iuranData.nama_jamaah}" untuk bulan ${new Date(iuranData.bulan_tahun).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}?`}
        confirmText="Update Iuran"
        cancelText="Batal"
        isLoading={updateIuranMutation.isPending}
        variant="primary"
      />
    </Modal>
  );
}