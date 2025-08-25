'use client';

import { useState } from 'react';
import { useRequireRole, useAuth } from '@/hooks/useAuth';
import { useIuranData } from '@/hooks/useIuranData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EditIuranForm } from '@/components/forms/EditIuranForm';
import { 
  Search, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminIuranPage() {
  const { hasAccess, isLoading: roleLoading } = useRequireRole(['superadmin', 'admin']);
  const { user } = useAuth();
  const { data: iuranData, isLoading: dataLoading } = useIuranData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [editingIuran, setEditingIuran] = useState<any>(null);

  if (roleLoading || !hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter and sort data
  const filteredData = iuranData?.filter((item) => {
    const matchesSearch = 
      item.nama_jamaah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = !selectedMonth || 
      new Date(item.bulan_tahun).toISOString().slice(0, 7) === selectedMonth;
    
    return matchesSearch && matchesMonth;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return (b.total_iuran || 0) - (a.total_iuran || 0);
      case 'name':
        return a.nama_jamaah.localeCompare(b.nama_jamaah);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) || [];

  // Calculate stats
  const totalIuran = filteredData.reduce((sum, item) => sum + (item.total_iuran || 0), 0);
  const totalSubmissions = filteredData.length;
  const uniqueContributors = new Set(filteredData.map(item => item.user_id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Data Iuran
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Kelola dan pantau data iuran dari seluruh jamaah
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Iuran</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalIuran)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Submisi</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalSubmissions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Kontributor</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {uniqueContributors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama jamaah atau username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="glass-input font-normal text-base w-full"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'name')}
              className="glass-input font-normal text-base w-full md:w-48"
            >
              <option value="date">Terbaru</option>
              <option value="amount">Terbesar</option>
              <option value="name">Nama A-Z</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedMonth('');
                setSortBy('date');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Iuran ({filteredData.length} data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Tidak ada data iuran
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || selectedMonth ? 'Coba ubah filter pencarian' : 'Belum ada data iuran yang disubmit'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Jamaah</th>
                    <th className="text-left p-4">Bulan</th>
                    <th className="text-left p-4">Total Iuran</th>
                    <th className="text-left p-4">Detail</th>
                    <th className="text-left p-4">Tanggal Submit</th>
                    <th className="text-right p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.nama_jamaah}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{item.users?.username || item.username}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-primary-500/10 to-primary-600/10 backdrop-blur-sm border border-primary-300/30 dark:border-primary-500/30">
                          <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" />
                          <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                            {new Date(item.bulan_tahun).toLocaleDateString('id-ID', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(item.total_iuran || 0)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {[
                            item.iuran_1 > 0 ? { label: '1', amount: item.iuran_1 } : null,
                            item.iuran_2 > 0 ? { label: '2', amount: item.iuran_2 } : null,
                            item.iuran_3 > 0 ? { label: '3', amount: item.iuran_3 } : null,
                            item.iuran_4 > 0 ? { label: '4', amount: item.iuran_4 } : null,
                            item.iuran_5 > 0 ? { label: '5', amount: item.iuran_5 } : null,
                          ].filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {[
                                item.iuran_1 > 0 ? { label: '1', amount: item.iuran_1 } : null,
                                item.iuran_2 > 0 ? { label: '2', amount: item.iuran_2 } : null,
                                item.iuran_3 > 0 ? { label: '3', amount: item.iuran_3 } : null,
                                item.iuran_4 > 0 ? { label: '4', amount: item.iuran_4 } : null,
                                item.iuran_5 > 0 ? { label: '5', amount: item.iuran_5 } : null,
                              ].filter(Boolean).map((iuran, index) => (
                                <div key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-700/50">
                                  <span className="text-green-800 dark:text-green-200 font-semibold mr-1">#{iuran.label}:</span>
                                  <span className="text-green-700 dark:text-green-300">{formatCurrency(iuran.amount)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                              Tidak ada iuran
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {formatDate(new Date(item.created_at))}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit iuran"
                            onClick={() => setEditingIuran(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            title="Hapus data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditIuranForm
        isOpen={!!editingIuran}
        onClose={() => setEditingIuran(null)}
        iuranData={editingIuran}
        currentUserId={user?.id}
        currentUserRole={user?.role}
      />
    </div>
  );
}