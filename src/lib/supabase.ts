/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini menginisialisasi client Supabase dan mendefinisikan tipe skema database.
 */

import { createClient } from '@supabase/supabase-js';

/* Mengambil URL Supabase dari environment variables. Tanda '!' memastikan nilainya tidak null. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
/* Mengambil kunci anon Supabase dari environment variables. Tanda '!' memastikan nilainya tidak null. */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * @constant supabase
 * @description Instance client Supabase.
 * Opsi `persistSession` dinonaktifkan karena kita menggunakan solusi otentikasi kustom (Zustand store).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false /* Menonaktifkan Supabase Auth karena menggunakan otentikasi kustom */
    }
});

/**
 * @type Database
 * @description Mendefinisikan tipe TypeScript untuk skema database Supabase.
 * Ini memberikan keamanan tipe (type safety) saat berinteraksi dengan database.
 */
export type Database = {
    public: {
        Tables: {
            /* Mendefinisikan struktur untuk tabel 'users'. */
            users: {
                /* Bentuk (shape) dari sebuah baris (row) di tabel 'users'. */
                Row: {
                    id: string;
                    username: string;
                    full_name: string;
                    role: 'superadmin' | 'admin' | 'jamaah';
                    created_at: string;
                    updated_at: string;
                };
                /* Bentuk data yang diperlukan untuk menyisipkan baris baru ke tabel 'users'. */
                Insert: {
                    id: string;
                    username: string;
                    full_name: string;
                    role?: 'superadmin' | 'admin' | 'jamaah';
                    created_at?: string;
                    updated_at?: string;
                };
                /* Bentuk data yang diperlukan untuk memperbarui baris di tabel 'users'. */
                Update: {
                    id?: string;
                    username?: string;
                    full_name?: string;
                    role?: 'superadmin' | 'admin' | 'jamaah';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            /* Mendefinisikan struktur untuk tabel 'iuran_submissions'. */
            iuran_submissions: {
                /* Bentuk dari sebuah baris di tabel 'iuran_submissions'. */
                Row: {
                    id: string;
                    user_id: string;
                    nama_jamaah: string;
                    bulan_tahun: string;
                    timestamp_submitted: string;
                    iuran_1: number;
                    iuran_2: number;
                    iuran_3: number;
                    iuran_4: number;
                    iuran_5: number;
                    total_iuran: number;
                    created_at: string;
                    updated_at: string;
                };
                /* Bentuk data yang diperlukan untuk menyisipkan baris baru ke tabel 'iuran_submissions'. */
                Insert: {
                    id?: string;
                    user_id: string;
                    nama_jamaah: string;
                    bulan_tahun: string;
                    timestamp_submitted?: string;
                    iuran_1?: number;
                    iuran_2?: number;
                    iuran_3?: number;
                    iuran_4?: number;
                    iuran_5?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                /* Bentuk data yang diperlukan untuk memperbarui baris di tabel 'iuran_submissions'. */
                Update: {
                    id?: string;
                    user_id?: string;
                    nama_jamaah?: string;
                    bulan_tahun?: string;
                    timestamp_submitted?: string;
                    iuran_1?: number;
                    iuran_2?: number;
                    iuran_3?: number;
                    iuran_4?: number;
                    iuran_5?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            /* Mendefinisikan struktur untuk tabel 'audit_logs'. */
            audit_logs: {
                /* Bentuk dari sebuah baris di tabel 'audit_logs'. */
                Row: {
                    id: string;
                    user_id: string;
                    action: string;
                    table_name: string;
                    record_id?: string;
                    old_values?: Record<string, unknown>;
                    new_values?: Record<string, unknown>;
                    timestamp: string;
                };
                /* Bentuk data yang diperlukan untuk menyisipkan baris baru ke tabel 'audit_logs'. */
                Insert: {
                    id?: string;
                    user_id: string;
                    action: string;
                    table_name: string;
                    record_id?: string;
                    old_values?: Record<string, unknown>;
                    new_values?: Record<string, unknown>;
                    timestamp?: string;
                };
                /* Bentuk data yang diperlukan untuk memperbarui baris di tabel 'audit_logs'. */
                Update: {
                    id?: string;
                    user_id?: string;
                    action?: string;
                    table_name?: string;
                    record_id?: string;
                    old_values?: Record<string, unknown>;
                    new_values?: Record<string, unknown>;
                    timestamp?: string;
                };
            };
        };
    };
};