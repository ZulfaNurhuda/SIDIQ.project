/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini berisi fungsi-fungsi utilitas yang digunakan di seluruh aplikasi.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn
 * @description Fungsi utilitas untuk menggabungkan kelas-kelas CSS Tailwind.
 * Menggunakan `clsx` untuk menggabungkan nama kelas secara kondisional dan `tailwind-merge` untuk mengatasi kelas yang konflik.
 * @param {...ClassValue[]} inputs - Daftar nama kelas atau nama kelas kondisional.
 * @returns {string} Nama kelas yang telah digabungkan.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * @function formatCurrency
 * @description Memformat angka sebagai mata uang Rupiah Indonesia (IDR).
 * @param {number} amount - Angka yang akan diformat.
 * @returns {string} String mata uang yang telah diformat (contoh: "Rp 10.000").
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * @function formatNumber
 * @description Memformat angka sesuai dengan lokal Indonesia.
 * @param {number} amount - Angka yang akan diformat.
 * @returns {string} String angka yang telah diformat (contoh: "10.000").
 */
export function formatNumber(amount: number): string {
    return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * @function parseCurrency
 * @description Mengurai (parse) string mata uang yang diformat menjadi angka.
 * Fungsi ini menghapus simbol mata uang dan pemisah ribuan.
 * @param {string} value - String mata uang yang akan diurai.
 * @returns {number} Angka hasil parse, atau 0 jika parse gagal.
 */
export function parseCurrency(value: string): number {
    /* Hapus semua karakter non-digit kecuali koma (desimal) dan minus */
    const cleaned = value.replace(/[^\d,-]/g, '');

    /* Tangani string kosong */
    if (!cleaned) return 0;

    /* Dalam format Indonesia: titik adalah pemisah ribuan, koma adalah desimal */
    /* Namun, karena kita bekerja dengan integer (tanpa desimal untuk mata uang), hapus saja semua pemisah */
    const result = cleaned.replace(/[.,]/g, '');

    const parsed = parseInt(result, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * @function formatDate
 * @description Memformat objek Date menjadi string dengan format bulan panjang untuk lokal Indonesia.
 * @param {Date} date - Objek Date yang akan diformat.
 * @returns {string} String tanggal yang telah diformat (contoh: "1 Januari 2023").
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

/**
 * @function getCurrentMonthYear
 * @description Mendapatkan objek Date yang merepresentasikan hari pertama dari bulan dan tahun saat ini di zona waktu lokal.
 * @returns {Date} Objek Date untuk hari pertama bulan ini.
 */
export function getCurrentMonthYear(): Date {
    const now = new Date();
    /* Buat tanggal di zona waktu lokal untuk menghindari masalah konversi UTC */
    const year = now.getFullYear();
    const month = now.getMonth();
    return new Date(year, month, 1);
}

/**
 * @function getCurrentMonthYearString
 * @description Mendapatkan string yang merepresentasikan hari pertama dari bulan dan tahun saat ini dalam format "YYYY-MM-DD".
 * @returns {string} String tanggal yang telah diformat.
 */
export function getCurrentMonthYearString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); /* getMonth() dimulai dari 0 */
    return `${year}-${month}-01`;
}
