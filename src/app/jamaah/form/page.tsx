/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen JamaahFormPage, yang menampilkan form pengajuan iuran bulanan.
 */

'use client';

import { IuranForm } from '@/components/forms/IuranForm';
import { PageTitle } from '@/components/ui/PageTitle';
import { PlusCircle } from 'lucide-react';

/**
 * @function JamaahFormPage
 * @description Komponen halaman untuk pengguna 'jamaah' untuk mengirimkan iuran bulanan mereka.
 * Terutama merender komponen `IuranForm`.
 * @returns {JSX.Element} Halaman form pengajuan iuran yang dirender.
 */
export default function JamaahFormPage() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <PageTitle
                    title="Form Iuran Bulanan"
                    description="Silakan isi nominal iuran untuk bulan ini"
                    icon={PlusCircle}
                />
            </div>

            <IuranForm />
        </div>
    );
}
