/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen ThemeToggle, yang memungkinkan pengguna untuk beralih antar tema warna.
 */

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * @function ThemeToggle
 * @description Komponen tombol yang memungkinkan pengguna untuk menggilir tema warna yang tersedia: terang, gelap, dan default sistem.
 * Menggunakan pustaka `next-themes` untuk manajemen tema.
 * @returns {JSX.Element} Tombol pengalih tema yang telah dirender.
 */
export function ThemeToggle() {
    /* State untuk melacak apakah komponen sudah di-mount, untuk menghindari masalah ketidakcocokan hidrasi dengan tema. */
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    /* Saat komponen di-mount, atur state mounted menjadi true. */
    useEffect(() => {
        setMounted(true);
    }, []);

    /* Render tombol placeholder sampai komponen di-mount untuk mencegah ketidakcocokan server-klien. */
    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="p-2 h-auto">
                <Monitor className="h-4 w-4" />
            </Button>
        );
    }

    /**
     * @function cycleTheme
     * @description Menggilir tema dengan urutan: terang -> gelap -> sistem.
     */
    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    /**
     * @function getIcon
     * @description Mendapatkan ikon yang sesuai untuk ditampilkan berdasarkan tema saat ini.
     * @returns {JSX.Element} Komponen ikon.
     */
    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="h-4 w-4 text-amber-500" />;
            case 'dark':
                return <Moon className="h-4 w-4 text-blue-400" />;
            default:
                return <Monitor className="h-4 w-4 text-gray-500" />;
        }
    };

    /**
     * @function getTooltip
     * @description Mendapatkan teks tooltip yang sesuai untuk ditampilkan berdasarkan tema saat ini.
     * @returns {string} Teks tooltip.
     */
    const getTooltip = () => {
        switch (theme) {
            case 'light':
                return 'Mode Terang - Klik untuk Dark Mode';
            case 'dark':
                return 'Mode Gelap - Klik untuk System Mode';
            default:
                return 'Mode Sistem - Klik untuk Light Mode';
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="p-2 h-auto hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all duration-200"
            title={getTooltip()}
        >
            {getIcon()}
        </Button>
    );
}
