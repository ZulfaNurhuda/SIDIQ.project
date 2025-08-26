'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIuranData } from '@/hooks/useIuranData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { exportToXLSX, exportToCSV, exportToJSON, exportToXML } from '@/lib/exportUtils';
import { Download, FileText, Filter, Calendar } from 'lucide-react';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  jamaahName?: string;
}

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: iuranData, isLoading } = useIuranData();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExportFilters>();

  const filters = watch();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Apply filters to data
  const getFilteredData = () => {
    if (!iuranData) return [];
    
    return iuranData.filter(item => {
      // Filter by date range
      if (filters.startDate) {
        const itemDate = new Date(item.bulan_tahun);
        const startDate = new Date(filters.startDate);
        if (itemDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const itemDate = new Date(item.bulan_tahun);
        const endDate = new Date(filters.endDate);
        if (itemDate > endDate) return false;
      }
      
      // Filter by jamaah name
      if (filters.jamaahName) {
        const searchTerm = filters.jamaahName.toLowerCase();
        if (!item.nama_jamaah.toLowerCase().includes(searchTerm)) return false;
      }
      
      return true;
    });
  };

  const handleExport = async (format: 'xlsx' | 'csv' | 'json' | 'xml') => {
    setIsExporting(true);
    
    try {
      const filteredData = getFilteredData();
      // Format: YYYY-MM-DDTHH-mm-ss (ISO-8601 dengan waktu lokal)
      const now = new Date();
      const timestamp = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + '-' +
        String(now.getMinutes()).padStart(2, '0') + '-' +
        String(now.getSeconds()).padStart(2, '0');
      const filename = `iuran_export_${timestamp}`;
      
      switch (format) {
        case 'xlsx':
          exportToXLSX(filteredData, filename);
          break;
        case 'csv':
          exportToCSV(filteredData, filename);
          break;
        case 'json':
          exportToJSON(filteredData, filename);
          break;
        case 'xml':
          exportToXML(filteredData, filename);
          break;
      }
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Export error handling
    } finally {
      setIsExporting(false);
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
          Export Data Iuran
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-300">
          Export data iuran dalam berbagai format (XLSX, CSV, XML, JSON)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              label="Tanggal Selesai"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
            <Input
              label="Nama Jamaah"
              placeholder="Cari nama jamaah..."
              {...register('jamaahName')}
              error={errors.jamaahName?.message}
            />
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300">
                  {filteredData.length} dari {iuranData?.length || 0} records
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300">
                  Total: {filteredData.reduce((sum, item) => sum + item.total_iuran, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Format Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting || filteredData.length === 0}
              isLoading={isExporting}
              className="h-auto p-6 flex-col space-y-2"
            >
              <FileText className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">XLSX</div>
                <div className="text-xs opacity-80">Spreadsheet format</div>
              </div>
            </Button>

            <Button
              onClick={() => handleExport('csv')}
              disabled={isExporting || filteredData.length === 0}
              isLoading={isExporting}
              variant="secondary"
              className="h-auto p-6 flex-col space-y-2"
            >
              <FileText className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">CSV</div>
                <div className="text-xs opacity-80">Comma separated</div>
              </div>
            </Button>

            <Button
              onClick={() => handleExport('json')}
              disabled={isExporting || filteredData.length === 0}
              isLoading={isExporting}
              variant="default"
              className="h-auto p-6 flex-col space-y-2"
            >
              <FileText className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">JSON</div>
                <div className="text-xs opacity-80">API format</div>
              </div>
            </Button>

            <Button
              onClick={() => handleExport('xml')}
              disabled={isExporting || filteredData.length === 0}
              isLoading={isExporting}
              variant="secondary"
              className="h-auto p-6 flex-col space-y-2"
            >
              <FileText className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">XML</div>
                <div className="text-xs opacity-80">Structured data</div>
              </div>
            </Button>
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">
                Tidak ada data untuk di-export dengan filter yang dipilih
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-400/80 dark:border-gray-700">
                    <th className="text-left p-2">Nama Jamaah</th>
                    <th className="text-left p-2">Bulan/Tahun</th>
                    <th className="text-right p-2">Total Iuran</th>
                    <th className="text-left p-2">Tanggal Submit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b border-gray-300/65 dark:border-gray-800">
                      <td className="p-2 font-medium">{item.nama_jamaah}</td>
                      <td className="p-2">
                        {new Date(item.bulan_tahun).toLocaleDateString('id-ID', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {item.total_iuran.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </td>
                      <td className="p-2">
                        {new Date(item.timestamp_submitted).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 10 && (
                <p className="text-center py-4 text-gray-600 dark:text-gray-300 text-sm">
                  ... dan {filteredData.length - 10} data lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}