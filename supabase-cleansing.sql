-- =================================================================
-- ⚠️  DANGER: DATABASE COMPLETE CLEANUP SCRIPT ⚠️
-- =================================================================
-- This script will PERMANENTLY DELETE ALL DATA and database objects:
-- • All tables and their data
-- • All functions and stored procedures  
-- • All custom types and enums
-- • All Row Level Security (RLS) policies
-- • All triggers and constraints
-- • All extensions (except built-in ones)
--
-- ⚠️  MAKE SURE YOU HAVE A COMPLETE BACKUP BEFORE RUNNING THIS! ⚠️
-- =================================================================

-- Uncomment the line below to enable error stopping
-- \set ON_ERROR_STOP on

BEGIN;

-- =================================================================
-- Step 1: Disable RLS and drop all policies
-- =================================================================
-- First disable RLS to prevent policy conflicts during cleanup
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.iuran_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Then drop all existing policies
DROP POLICY IF EXISTS "superadmin_all_access" ON public.users;
DROP POLICY IF EXISTS "admin_jamaah_access" ON public.users;
DROP POLICY IF EXISTS "jamaah_own_access" ON public.users;
DROP POLICY IF EXISTS "admin_all_submissions" ON public.iuran_submissions;
DROP POLICY IF EXISTS "jamaah_own_submissions" ON public.iuran_submissions;
DROP POLICY IF EXISTS "superadmin_audit_access" ON public.audit_logs;

-- =================================================================
-- Step 2: Drop all triggers (before dropping their functions)
-- =================================================================
DROP TRIGGER IF EXISTS trigger_calculate_total_iuran ON public.iuran_submissions;
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_update_submissions_updated_at ON public.iuran_submissions;
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
DROP TRIGGER IF EXISTS audit_submissions_trigger ON public.iuran_submissions;

-- =================================================================
-- Step 3: Drop all tables with CASCADE
-- =================================================================
-- This will remove all data, constraints, indexes, and dependent objects
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.iuran_submissions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =================================================================
-- Step 4: Drop all custom functions
-- =================================================================
-- Authentication and user management functions
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.add_new_user(TEXT, TEXT, TEXT, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_active_users() CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats_active() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_details(UUID, VARCHAR, VARCHAR, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.change_user_password(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_by_id(UUID) CASCADE;

-- Iuran submission functions
DROP FUNCTION IF EXISTS public.add_iuran_submission(UUID, VARCHAR, DATE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.update_iuran_submission(UUID, VARCHAR, DATE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.delete_iuran_submission(UUID) CASCADE;

-- Data retrieval functions
DROP FUNCTION IF EXISTS public.get_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_submissions() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_submissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_export_data(DATE, DATE) CASCADE;

-- Utility functions
DROP FUNCTION IF EXISTS public.hash_password(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_monthly_submission(UUID, DATE) CASCADE;

-- =================================================================
-- Step 5: Drop all trigger functions
-- =================================================================
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_total_iuran() CASCADE;

-- =================================================================
-- Step 6: Drop all custom types and enums
-- =================================================================
DROP TYPE IF EXISTS public.user_role CASCADE;

-- =================================================================
-- Step 7: Drop custom extensions (if any were added)
-- =================================================================
-- Note: pgcrypto is commonly used, uncomment if you want to remove it
-- DROP EXTENSION IF EXISTS pgcrypto;

-- =================================================================
-- Step 8: Reset any custom settings
-- =================================================================
-- Clear any custom configuration settings
SELECT pg_reload_conf();

COMMIT;

-- =================================================================
-- ✅ DATABASE CLEANUP COMPLETED
-- =================================================================
-- All tables, functions, types, and policies have been removed.
-- The database is now in a clean state ready for fresh setup.
-- 
-- Next steps:
-- 1. Run your setup script (supabase-setup.sql)
-- 2. Verify all objects are created correctly
-- 3. Test your application functionality
-- =================================================================