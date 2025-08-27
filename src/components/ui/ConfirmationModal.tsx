/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen ConfirmationModal, sebuah dialog yang dapat digunakan kembali untuk mengonfirmasi tindakan pengguna.
 */

'use client';

import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * @interface ConfirmationModalProps
 * @description Mendefinisikan properti untuk komponen ConfirmationModal.
 * @property {boolean} isOpen - Apakah modal sedang terbuka.
 * @property {() => void} onClose - Fungsi yang dipanggil saat modal harus ditutup.
 * @property {() => void} onConfirm - Fungsi yang dipanggil saat tombol konfirmasi diklik.
 * @property {string} title - Judul modal.
 * @property {string | ReactNode} message - Pesan yang akan ditampilkan di dalam modal.
 * @property {string} [confirmText='Konfirmasi'] - Teks untuk tombol konfirmasi.
 * @property {string} [cancelText='Batal'] - Teks untuk tombol batal.
 * @property {boolean} [isLoading=false] - Jika true, tombol konfirmasi akan menampilkan status loading.
 * @property {'danger' | 'warning' | 'info' | 'success'} [variant='danger'] - Gaya visual modal, memengaruhi warna ikon dan tombol.
 */
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

/**
 * @function ConfirmationModal
 * @description Komponen modal yang dapat digunakan kembali untuk meminta konfirmasi pengguna sebelum melakukan suatu tindakan.
 * Mendukung berbagai varian (danger, warning, dll.) untuk menunjukkan sifat tindakan secara visual.
 * @param {ConfirmationModalProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen modal konfirmasi yang telah dirender.
 */
export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isLoading = false,
    variant = 'danger'
}: ConfirmationModalProps) {

    /**
     * @function getVariantStyles
     * @description Menentukan gaya yang sesuai (warna, ikon) berdasarkan varian modal.
     * @returns {object} Objek yang berisi informasi gaya.
     */
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-100 dark:bg-red-900/20',
                    buttonVariant: 'destructive' as const,
                    icon: AlertTriangle
                };
            case 'warning':
                return {
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
                    buttonVariant: 'warning' as const,
                    icon: AlertTriangle
                };
            case 'success':
                return {
                    iconColor: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                    buttonVariant: 'default' as const,
                    icon: CheckCircle
                };
            default: /* Varian 'info' */
                return {
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
                    buttonVariant: 'default' as const,
                    icon: AlertTriangle
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                    {/* Kontainer ikon dengan warna latar belakang spesifik varian */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bgColor}`}>
                        <styles.icon className={`w-5 h-5 ${styles.iconColor}`} />
                    </div>
                    <div className="flex-1">
                        {/* Konten pesan modal */}
                        <div className="text-gray-700 dark:text-white">
                            {message}
                        </div>
                    </div>
                </div>

                {/* Tombol aksi */}
                <div className="flex space-x-3 pt-4">
                    {cancelText && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant={styles.buttonVariant}
                        onClick={onConfirm}
                        className="flex-1"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
