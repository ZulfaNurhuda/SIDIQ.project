/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Sidebar, yang menyediakan navigasi utama untuk aplikasi.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import packageJson from '../../../package.json';
import {
    LayoutDashboard,
    Users,
    FileText,
    Download,
    History,
    Settings,
    PlusCircle,
} from 'lucide-react';

/**
 * @constant navigationItems
 * @description Array objek yang mendefinisikan tautan navigasi, ikon, path, dan peran yang terkait.
 */
const navigationItems = [
    {
        name: 'Dasbor',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['superadmin', 'admin'],
    },
    {
        name: 'Manajemen User',
        href: '/admin/users',
        icon: Users,
        roles: ['superadmin', 'admin'],
    },
    {
        name: 'Data Iuran',
        href: '/admin/iuran',
        icon: FileText,
        roles: ['superadmin', 'admin'],
    },
    {
        name: 'Export Data',
        href: '/admin/export',
        icon: Download,
        roles: ['superadmin', 'admin'],
    },
    {
        name: 'Form Iuran',
        href: '/jamaah/form',
        icon: PlusCircle,
        roles: ['jamaah'],
    },
    {
        name: 'Riwayat Iuran',
        href: '/jamaah/history',
        icon: History,
        roles: ['jamaah'],
    },
    {
        name: 'Pengaturan',
        href: '/settings',
        icon: Settings,
        roles: ['superadmin', 'admin', 'jamaah'],
    },
];

/**
 * @function Sidebar
 * @description Komponen navigasi sidebar utama.
 * Memfilter tautan navigasi berdasarkan peran pengguna yang terotentikasi.
 * Juga menampilkan versi aplikasi dan informasi hak cipta di footer.
 * @returns {JSX.Element | null} Komponen sidebar yang dirender atau null jika tidak ada pengguna yang terotentikasi.
 */
export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    /* Jangan render sidebar jika tidak ada pengguna yang terotentikasi. */
    if (!user) return null;

    /* Filter item navigasi untuk menampilkan hanya yang dapat diakses oleh peran pengguna saat ini. */
    const filteredItems = navigationItems.filter(item =>
        item.roles.includes(user.role)
    );

    return (
        <aside className="w-64 bg-blue-50/40 dark:bg-black/20 backdrop-blur-md border border-gray-300/70 dark:border-white/10 shadow-sm h-[calc(100vh-7.5rem)] mt-8 sticky top-24 flex flex-col rounded-lg ml-4">
            <nav className="p-4 space-y-2 flex-1">
                {/* Render tautan navigasi yang telah difilter. */}
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-400/60 dark:border-primary-300/50'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Admin dan superadmin juga melihat tautan ke halaman iuran pribadi mereka. */}
                {['admin', 'superadmin'].includes(user.role) && (
                    <>
                        <div className="my-4 border-t border-gray-300/60 dark:border-white/15" />
                        <Link
                            href="/jamaah/form"
                            className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname === '/jamaah/form'
                                    ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-400/60 dark:border-primary-300/50'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'
                            )}
                            title="Form iuran pribadi"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Form Iuran</span>
                        </Link>
                        <Link
                            href="/jamaah/history"
                            className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname === '/jamaah/history'
                                    ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-400/60 dark:border-primary-300/50'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'
                            )}
                            title="Riwayat iuran pribadi"
                        >
                            <History className="h-5 w-5" />
                            <span>Riwayat Iuran</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* Bagian footer dengan info aplikasi dan versi. */}
            <div className="p-4 border-t border-gray-300/55 dark:border-white/10 mt-auto">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white tracking-wide">
                                SIDIQ
                            </h4>
                            <div className="inline-flex items-center px-1.5 py-0.5 bg-blue-500/20 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                                v{packageJson.version}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                            Sistem Informasi Pengelolaan Data Infaq © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}