/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen DashboardPage, yang menampilkan statistik kunci dan data iuran terbaru.
 */

'use client';

import { useRequireRole } from '@/hooks/useAuth';
import { useDashboardStats, useIuranData } from '@/hooks/useIuranData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Users, DollarSign, CheckCircle, Clock, LayoutDashboard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * @function DashboardPage
 * @description Halaman dashboard utama untuk administrator.
 * Menampilkan statistik agregat tentang pengguna dan data iuran,
 * serta daftar aktivitas iuran terbaru.
 * Akses dibatasi untuk peran 'superadmin' dan 'admin'.
 * @returns {JSX.Element} Halaman dashboard yang dirender.
 */
export default function DashboardPage() {
    /* Periksa peran pengguna untuk kontrol akses. */
    const { hasAccess, isLoading: roleLoading } = useRequireRole(['superadmin', 'admin']);
    /* Ambil statistik dashboard. */
    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    /* Ambil semua data iuran untuk menampilkan data terbaru. */
    const { data: iuranData, isLoading: iuranLoading } = useIuranData();

    /* Tampilkan ikon loading jika pemeriksaan peran sedang berlangsung atau akses ditolak. */
    if (roleLoading || !hasAccess) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /* Tentukan status loading keseluruhan. */
    const isLoading = statsLoading || iuranLoading;

    /* Tampilkan ikon loading jika data masih diambil. */
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /* Ambil 5 data iuran terbaru. */
    const recentSubmissions = iuranData?.slice(0, 5) || [];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Dasbor Admin"
                description="Overview sistem informasi infaq bulanan"
                icon={LayoutDashboard}
            />

            {/* Grid Statistik */}
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

            {/* Bagian Data Terbaru */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <span className="text-blue-900 dark:text-white">Iuran Terbaru</span>
                    </CardTitle>
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
