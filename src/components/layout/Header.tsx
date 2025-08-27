/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Header, yang berfungsi sebagai bar navigasi atas untuk aplikasi.
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { LogOut, User } from 'lucide-react';

/**
 * @function Header
 * @description Komponen header utama untuk aplikasi.
 * Menampilkan nama aplikasi, nama dan peran pengguna saat ini, tombol tema, dan tombol logout.
 * Tidak akan dirender jika tidak ada pengguna yang terotentikasi.
 * @returns {JSX.Element | null} Komponen header yang dirender atau null jika tidak terotentikasi.
 */
export function Header() {
    /* Ambil fungsi user dan logout dari hook otentikasi. */
    const { user, logout } = useAuth();

    /* Jangan render header jika tidak ada pengguna yang terotentikasi. */
    if (!user) return null;

    /**
     * @function getRoleBadgeVariant
     * @description Menentukan varian warna untuk badge peran berdasarkan peran pengguna.
     * @param {string} role - Peran pengguna.
     * @returns {'error' | 'warning' | 'success' | 'default'} Varian badge.
     */
    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'error';
            case 'admin':
                return 'warning';
            case 'jamaah':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <header className="glass-nav sticky top-4 z-40 rounded-lg mx-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Bagian kiri: Nama aplikasi dan peran pengguna */}
                    <div className="flex items-center space-x-4">
                        <h1 className="text-heading-3 text-gray-900 dark:text-white font-semibold">
                            SIDIQ
                        </h1>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Bagian kanan: Info pengguna, tombol tema, dan logout */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            <span className="text-body-small text-gray-900 dark:text-white font-medium">
                                {user.full_name}
                            </span>
                        </div>

                        <ThemeToggle />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="p-2 h-auto"
                            title="Keluar"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
