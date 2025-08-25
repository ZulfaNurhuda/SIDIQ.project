'use client';

import { useRequireRole } from '@/hooks/useAuth';
import { useDashboardStats, useIuranData } from '@/hooks/useIuranData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { hasAccess, isLoading: roleLoading } = useRequireRole(['superadmin', 'admin']);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: iuranData, isLoading: iuranLoading } = useIuranData();

  if (roleLoading || !hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLoading = statsLoading || iuranLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentSubmissions = iuranData?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Dashboard Admin
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Overview sistem informasi infaq bulanan
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Jamaah"
          value={stats?.totalJamaah || 0}
          icon={Users}
          description="Jamaah terdaftar"
        />
        <StatsCard
          title="Iuran Bulan Ini"
          value={stats?.totalIuranThisMonth || 0}
          icon={DollarSign}
          format="currency"
          description="Total iuran terkumpul"
        />
        <StatsCard
          title="Sudah Bayar"
          value={stats?.submissionThisMonth || 0}
          icon={CheckCircle}
          description="Jamaah yang sudah bayar"
        />
        <StatsCard
          title="Belum Bayar"
          value={stats?.pendingSubmissions || 0}
          icon={Clock}
          description="Jamaah yang belum bayar"
        />
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Iuran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              Belum ada data iuran
            </p>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 glass-card"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {submission.nama_jamaah}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(new Date(submission.timestamp_submitted))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(submission.total_iuran)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(submission.bulan_tahun).toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}