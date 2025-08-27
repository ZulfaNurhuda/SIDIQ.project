/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Modal, sebuah jendela dialog serbaguna.
 */

'use client';

import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * @interface ModalProps
 * @description Mendefinisikan properti untuk komponen Modal.
 * @property {boolean} isOpen - Apakah modal sedang terbuka.
 * @property {() => void} onClose - Fungsi yang dipanggil saat modal harus ditutup.
 * @property {string} [title] - Judul yang akan ditampilkan di header modal.
 * @property {ReactNode} children - Konten yang akan dirender di dalam body modal.
 * @property {'sm' | 'md' | 'lg' | 'xl'} [size='md'] - Lebar modal.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * @function Modal
 * @description Komponen modal/dialog yang dapat digunakan kembali, dibangun menggunakan Headless UI.
 * Termasuk transisi, latar belakang, tombol tutup, serta ukuran dan konten yang dapat disesuaikan.
 * @param {ModalProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen modal yang telah dirender.
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    /* Mendefinisikan kelas-kelas Tailwind CSS untuk berbagai ukuran modal. */
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Latar belakang (backdrop) */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        {/* Panel modal itu sendiri */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden glass-card p-6 text-left align-middle shadow-lg transition-all`}>
                                <div className="flex items-center justify-between mb-4">
                                    {/* Judul modal */}
                                    {title && (
                                        <Dialog.Title as="h3" className="text-heading-3 text-gray-900 dark:text-white">
                                            {title}
                                        </Dialog.Title>
                                    )}
                                    {/* Tombol tutup */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="p-2 h-auto"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                {/* Konten modal */}
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
