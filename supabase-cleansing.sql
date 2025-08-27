-- ==================================================================================================
-- || PROJECT: SIDIQ.project                                                                       ||
-- || AUTHOR: ZulfaNurhuda                                                                         ||
-- || GITHUB: https://github.com/ZulfaNurhuda/SIDIQ.project                                        ||
-- || DESCRIPTION: Skrip SQL ini menyediakan metode komprehensif dan destruktif untuk sepenuhnya   ||
-- ||              membersihkan database Supabase untuk aplikasi SIDIQ.project.                    ||
-- ||              Ini secara permanen menghapus semua tabel, fungsi, tipe, kebijakan, dan pemicu. ||
-- ||              GUNAKAN DENGAN SANGAT HATI-HATI DAN HANYA SETELAH MEMASTIKAN BACKUP LENGKAP.    ||
-- ==================================================================================================

-- =================================================================
-- ⚠️  BAHAYA: SKRIP PEMBERSIHAN LENGKAP DATABASE ⚠️
-- =================================================================
-- Skrip ini akan SECARA PERMANEN MENGHAPUS SEMUA DATA dan objek database:
-- • Semua tabel dan datanya
-- • Semua fungsi dan prosedur tersimpan  
-- • Semua tipe dan enum kustom
-- • Semua kebijakan Keamanan Tingkat Baris (RLS)
-- • Semua pemicu dan batasan
-- • Semua ekstensi (kecuali yang bawaan)
--
-- ⚠️  PASTIKAN ANDA MEMILIKI BACKUP LENGKAP SEBELUM MENJALANKAN INI! ⚠️
-- =================================================================

-- Batalkan komentar baris di bawah ini untuk mengaktifkan penghentian error
-- \set ON_ERROR_STOP on

BEGIN;

-- =================================================================
-- Langkah 1: Nonaktifkan RLS dan hapus semua kebijakan
-- =================================================================
-- Pertama nonaktifkan RLS untuk mencegah konflik kebijakan selama pembersihan
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.iuran_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Kemudian hapus semua kebijakan yang ada
DROP POLICY IF EXISTS "superadmin_all_access" ON public.users;
DROP POLICY IF EXISTS "admin_jamaah_access" ON public.users;
DROP POLICY IF EXISTS "jamaah_own_access" ON public.users;
DROP POLICY IF EXISTS "admin_all_submissions" ON public.iuran_submissions;
DROP POLICY IF EXISTS "jamaah_own_submissions" ON public.iuran_submissions;
DROP POLICY IF EXISTS "superadmin_audit_access" ON public.audit_logs;

-- =================================================================
-- Langkah 2: Hapus semua pemicu (sebelum menghapus fungsinya)
-- =================================================================
DROP TRIGGER IF EXISTS trigger_calculate_total_iuran ON public.iuran_submissions;
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_update_submissions_updated_at ON public.iuran_submissions;
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
DROP TRIGGER IF EXISTS audit_submissions_trigger ON public.iuran_submissions;

-- =================================================================
-- Langkah 3: Hapus semua tabel dengan CASCADE
-- =================================================================
-- Ini akan menghapus semua data, batasan, indeks, dan objek dependen
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.iuran_submissions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =================================================================
-- Langkah 4: Hapus semua fungsi kustom
-- =================================================================
-- Fungsi otentikasi dan manajemen pengguna
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.add_new_user(TEXT, TEXT, TEXT, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_active_users() CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats_active() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_details(UUID, VARCHAR, VARCHAR, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.change_user_password(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_by_id(UUID) CASCADE;

-- Fungsi pengajuan iuran
DROP FUNCTION IF EXISTS public.add_iuran_submission(UUID, VARCHAR, DATE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.update_iuran_submission(UUID, VARCHAR, DATE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.delete_iuran_submission(UUID) CASCADE;

-- Fungsi pengambilan data
DROP FUNCTION IF EXISTS public.get_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_submissions() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_submissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_export_data(DATE, DATE) CASCADE;

-- Fungsi utilitas
DROP FUNCTION IF EXISTS public.hash_password(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_monthly_submission(UUID, DATE) CASCADE;

-- =================================================================
-- Langkah 5: Hapus semua fungsi pemicu
-- =================================================================
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_total_iuran() CASCADE;

-- =================================================================
-- Langkah 6: Hapus semua tipe dan enum kustom
-- =================================================================
DROP TYPE IF EXISTS public.user_role CASCADE;

-- =================================================================
-- Langkah 7: Hapus ekstensi kustom (jika ada yang ditambahkan)
-- =================================================================
-- Catatan: pgcrypto umumnya digunakan, batalkan komentar jika Anda ingin menghapusnya
-- DROP EXTENSION IF EXISTS pgcrypto;

-- =================================================================
-- Langkah 8: Reset pengaturan kustom apa pun
-- =================================================================
-- Hapus pengaturan konfigurasi kustom apa pun
SELECT pg_reload_conf();

COMMIT;

-- =================================================================
-- ✅ PEMBERSIHAN DATABASE SELESAI
-- =================================================================
-- Semua tabel, fungsi, tipe, dan kebijakan telah dihapus.
-- Database sekarang dalam keadaan bersih siap untuk pengaturan baru.
-- 
-- Langkah selanjutnya:
-- 1. Jalankan skrip pengaturan Anda (supabase-setup.sql)
-- 2. Verifikasi semua objek dibuat dengan benar
-- 3. Uji fungsionalitas aplikasi Anda
-- =================================================================