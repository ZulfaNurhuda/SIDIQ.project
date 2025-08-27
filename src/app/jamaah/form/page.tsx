'use client';

import { IuranForm } from '@/components/forms/IuranForm';
import { PageTitle } from '@/components/ui/PageTitle';
import { PlusCircle } from 'lucide-react';

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