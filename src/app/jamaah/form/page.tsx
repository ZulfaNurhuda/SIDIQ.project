'use client';

import { IuranForm } from '@/components/forms/IuranForm';

export default function JamaahFormPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Form Iuran Bulanan
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Silakan isi nominal iuran untuk bulan ini
        </p>
      </div>

      <IuranForm />
    </div>
  );
}