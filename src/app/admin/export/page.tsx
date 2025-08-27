/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen ExportPage, yang memungkinkan admin untuk memfilter dan mengekspor data iuran.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIuranData } from '@/hooks/useIuranData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageTitle } from '@/components/ui/PageTitle';
import { exportToXLSX, exportToCSV, exportToJSON, exportToXML } from '@/lib/exportUtils';
import { Download, FileText, Filter, Calendar } from 'lucide-react';

/**
 * @interface ExportFilters
 * @description Mendefinisikan bentuk data form filter.
 */
interface ExportFilters {
    startDate?: string;
    endDate?: string;
    jamaahName?: string;
}

/**
 * @function ExportPage
 * @description Komponen halaman yang menyediakan UI untuk memfilter dan mengekspor data iuran ke
 * berbagai format (XLSX, CSV, JSON, XML). Termasuk pratinjau data.
 * @returns {JSX.Element} Halaman ekspor yang dirender.
 */
export default function ExportPage() {
    /* State untuk mengelola status loading tombol ekspor. */
    const [isExporting, setIsExporting] = useState(false);
    /* Ambil semua data iuran menggunakan hook kustom. */
    const { data: iuranData, isLoading } = useIuranData();

    const {
        register,
        watch,
        formState: { errors },
    } = useForm<ExportFilters>();

    /* Amati perubahan pada input filter untuk memperbarui data yang difilter secara real-time. */
    const filters = watch();

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
    }

    /**
     * @function getFilteredData
     * @description Memfilter data iuran mentah berdasarkan nilai filter saat ini.
     * @returns {any[]} Array data yang telah difilter.
     */
    const getFilteredData = () => {
        if (!iuranData) return [];

        return iuranData.filter(item => {
            if (filters.startDate) {
                if (new Date(item.bulan_tahun) < new Date(filters.startDate)) return false;
            }
            if (filters.endDate) {
                if (new Date(item.bulan_tahun) > new Date(filters.endDate)) return false;
            }
            if (filters.jamaahName) {
                if (!item.nama_jamaah.toLowerCase().includes(filters.jamaahName.toLowerCase())) return false;
            }
            return true;
        });
    };

    /**
     * @function handleExport
     * @description Memicu proses ekspor untuk format yang diberikan.
     * @param {'xlsx' | 'csv' | 'json' | 'xml'} format - Format ekspor yang diinginkan.
     */
    const handleExport = async (format: 'xlsx' | 'csv' | 'json' | 'xml') => {
        setIsExporting(true);
        try {
            const filteredData = getFilteredData();
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            const filename = `iuran_export_${timestamp}`;

            switch (format) {
                case 'xlsx': exportToXLSX(filteredData, filename); break;
                case 'csv': exportToCSV(filteredData, filename); break;
                case 'json': exportToJSON(filteredData, filename); break;
                case 'xml': exportToXML(filteredData, filename); break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const filteredData = getFilteredData();

    return (
        <div className="space-y-6">
            <PageTitle title="Export Data Iuran" description="Export data iuran dalam berbagai format (XLSX, CSV, XML, JSON)" icon={Download} />

            <Card>
                <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Filter className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Filter Data</span></CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Tanggal Mulai" type="date" {...register('startDate')} error={errors.startDate?.message} />
                        <Input label="Tanggal Selesai" type="date" {...register('endDate')} error={errors.endDate?.message} />
                        <Input label="Nama Jamaah" placeholder="Cari nama jamaah..." {...register('jamaahName')} error={errors.jamaahName?.message} />
                    </div>
                    <div className="mt-4 p-4 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1"><FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" /><span>{filteredData.length} dari {iuranData?.length || 0} data</span></div>
                            <div className="flex items-center space-x-1"><Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" /><span>Total: {filteredData.reduce((sum, item) => sum + item.total_iuran, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><Download className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Format Export</span></CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button onClick={() => handleExport('xlsx')} disabled={isExporting || filteredData.length === 0} isLoading={isExporting} className="h-auto p-6 flex-col space-y-2"><FileText className="h-8 w-8" /><div className="text-center"><div className="font-semibold">XLSX</div><div className="text-xs opacity-80">Format spreadsheet</div></div></Button>
                        <Button onClick={() => handleExport('csv')} disabled={isExporting || filteredData.length === 0} isLoading={isExporting} variant="secondary" className="h-auto p-6 flex-col space-y-2"><FileText className="h-8 w-8" /><div className="text-center"><div className="font-semibold">CSV</div><div className="text-xs opacity-80">Dipisahkan koma</div></div></Button>
                        <Button onClick={() => handleExport('json')} disabled={isExporting || filteredData.length === 0} isLoading={isExporting} variant="default" className="h-auto p-6 flex-col space-y-2"><FileText className="h-8 w-8" /><div className="text-center"><div className="font-semibold">JSON</div><div className="text-xs opacity-80">Format API</div></div></Button>
                        <Button onClick={() => handleExport('xml')} disabled={isExporting || filteredData.length === 0} isLoading={isExporting} variant="secondary" className="h-auto p-6 flex-col space-y-2"><FileText className="h-8 w-8" /><div className="text-center"><div className="font-semibold">XML</div><div className="text-xs opacity-80">Data terstruktur</div></div></Button>
                    </div>
                    {filteredData.length === 0 && <div className="text-center py-8"><p className="text-gray-600 dark:text-gray-300">Tidak ada data untuk di-export dengan filter yang dipilih</p></div>}
                </CardContent>
            </Card>

            {/* Pratinjau 10 baris pertama dari data yang difilter. */}
            {filteredData.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 dark:bg-blue-900/20 rounded-lg"><FileText className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div><span className="text-blue-900 dark:text-white">Preview Data</span></CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-gray-400/80 dark:border-gray-700"><th className="text-left p-2">Nama Jamaah</th><th className="text-left p-2">Bulan/Tahun</th><th className="text-right p-2">Total Iuran</th><th className="text-left p-2">Tanggal Submit</th></tr></thead>
                                <tbody>
                                    {filteredData.slice(0, 10).map((item) => (
                                        <tr key={item.id} className="border-b border-gray-300/65 dark:border-gray-800">
                                            <td className="p-2 font-medium">{item.nama_jamaah}</td>
                                            <td className="p-2">{new Date(item.bulan_tahun).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</td>
                                            <td className="p-2 text-right font-semibold">{item.total_iuran.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                            <td className="p-2">{new Date(item.timestamp_submitted).toLocaleDateString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length > 10 && <p className="text-center py-4 text-gray-600 dark:text-gray-300 text-sm">... dan {filteredData.length - 10} data lainnya</p>}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
