'use client';

import { useAuth } from '@/hooks/useAuth';
import { useIuranData } from '@/hooks/useIuranData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, DollarSign } from 'lucide-react';

export default function JamaahHistoryPage() {
  const { user } = useAuth();
  const { data: allIuran, isLoading } = useIuranData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter data untuk user yang sedang login
  const userIuran = allIuran?.filter(iuran => iuran.user_id === user?.id) || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Riwayat Iuran
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Riwayat pembayaran iuran bulanan Anda
        </p>
      </div>

      {userIuran.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-heading-3 text-gray-900 dark:text-white mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-body text-gray-600 dark:text-gray-300">
              Anda belum melakukan pembayaran iuran. Silakan isi form iuran terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {userIuran.map((iuran) => (
            <Card key={iuran.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(iuran.bulan_tahun).toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </CardTitle>
                  <Badge variant="success">Lunas</Badge>
                </div>
                <p className="text-body-small text-gray-600 dark:text-gray-300">
                  Dibayar: {formatDate(new Date(iuran.timestamp_submitted))}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-caption text-gray-600 dark:text-gray-400">Iuran 1</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(iuran.iuran_1)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-caption text-gray-600 dark:text-gray-400">Iuran 2</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(iuran.iuran_2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-caption text-gray-600 dark:text-gray-400">Iuran 3</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(iuran.iuran_3)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-caption text-gray-600 dark:text-gray-400">Iuran 4</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(iuran.iuran_4)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-caption text-gray-600 dark:text-gray-400">Iuran 5</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(iuran.iuran_5)}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-1 col-span-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      <p className="text-caption text-primary-600 dark:text-primary-400">Total</p>
                    </div>
                    <p className="text-heading-3 text-primary-900 dark:text-primary-100">
                      {formatCurrency(iuran.total_iuran)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      {userIuran.length > 0 && (
        <Card className="bg-blue-500/20 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-primary-900 dark:text-primary-100">
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-caption text-primary-600 dark:text-primary-400">
                  Total Pembayaran
                </p>
                <p className="text-heading-2 text-primary-900 dark:text-primary-100">
                  {userIuran.length}
                </p>
                <p className="text-body-small text-primary-700 dark:text-primary-300">
                  bulan
                </p>
              </div>
              <div className="text-center">
                <p className="text-caption text-primary-600 dark:text-primary-400">
                  Total Iuran
                </p>
                <p className="text-heading-2 text-primary-900 dark:text-primary-100">
                  {formatCurrency(userIuran.reduce((sum, iuran) => sum + iuran.total_iuran, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-caption text-primary-600 dark:text-primary-400">
                  Rata-rata per Bulan
                </p>
                <p className="text-heading-2 text-primary-900 dark:text-primary-100">
                  {formatCurrency(userIuran.reduce((sum, iuran) => sum + iuran.total_iuran, 0) / userIuran.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}