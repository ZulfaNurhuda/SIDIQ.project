/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen StatsCard, yang digunakan untuk menampilkan statistik kunci di dashboard.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * @interface StatsCardProps
 * @description Mendefinisikan properti untuk komponen StatsCard.
 * @property {string} title - Judul statistik (misalnya, "Total Jamaah").
 * @property {string | number} value - Nilai statistik.
 * @property {LucideIcon} icon - Ikon yang akan ditampilkan di header kartu.
 * @property {string} [description] - Deskripsi atau subteks opsional untuk statistik.
 * @property {'currency' | 'number'} [format='number'] - Cara memformat nilai. Jika 'currency', akan diformat sebagai IDR.
 */
interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    format?: 'currency' | 'number';
}

/**
 * @function StatsCard
 * @description Komponen yang menampilkan satu statistik dalam format kartu.
 * Termasuk judul, nilai, ikon, dan deskripsi opsional.
 * Dapat secara otomatis memformat nilai sebagai mata uang.
 * @param {StatsCardProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen kartu statistik yang telah dirender.
 */
export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    format = 'number'
}: StatsCardProps) {
    /* Format nilai sebagai mata uang jika ditentukan, jika tidak, konversi ke string. */
    const formattedValue = format === 'currency' && typeof value === 'number'
        ? formatCurrency(value)
        : value.toString();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formattedValue}
                </div>
                {description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
