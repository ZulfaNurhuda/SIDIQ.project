-- Create user roles enum
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'jamaah');

-- Create users table (standalone, tidak extend auth.users)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  full_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  role user_role NOT NULL DEFAULT 'jamaah',
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create iuran_submissions table
CREATE TABLE public.iuran_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  username VARCHAR NOT NULL, -- Store username for reconnection
  nama_jamaah VARCHAR NOT NULL,
  bulan_tahun DATE NOT NULL,
  timestamp_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  iuran_1 DECIMAL(15,2) DEFAULT 0,
  iuran_2 DECIMAL(15,2) DEFAULT 0,
  iuran_3 DECIMAL(15,2) DEFAULT 0,
  iuran_4 DECIMAL(15,2) DEFAULT 0,
  iuran_5 DECIMAL(15,2) DEFAULT 0,
  total_iuran DECIMAL(15,2) GENERATED ALWAYS AS (iuran_1 + iuran_2 + iuran_3 + iuran_4 + iuran_5) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bulan_tahun)
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action VARCHAR NOT NULL,
  table_name VARCHAR NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on selected tables
-- Temporarily disabled all RLS due to infinite recursion issues
-- Will use application-level security instead
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.iuran_submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role from JWT
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk mendapatkan current user session
CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.current_user_id', true)::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users table
-- For now, disable RLS on users table to avoid recursion issues
-- We'll use application-level security instead

-- RLS Policies for iuran_submissions table
-- Temporarily disabled due to infinite recursion with users table
-- Will use application-level security instead

-- CREATE POLICY "admin_all_submissions" ON public.iuran_submissions
--   FOR ALL USING (
--     (SELECT role FROM public.users WHERE id = get_current_user_id()) IN ('superadmin', 'admin')
--   );

-- CREATE POLICY "jamaah_own_submissions" ON public.iuran_submissions
--   FOR ALL USING (get_current_user_id() = user_id);

-- RLS Policies for audit_logs table
-- Temporarily disabled due to infinite recursion with users table
-- CREATE POLICY "superadmin_audit_access" ON public.audit_logs
--   FOR ALL USING (
--     (SELECT role FROM public.users WHERE id = get_current_user_id()) = 'superadmin'
--   );

-- Function to calculate total iuran
CREATE OR REPLACE FUNCTION calculate_total_iuran()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_iuran := COALESCE(NEW.iuran_1, 0) + 
                     COALESCE(NEW.iuran_2, 0) + 
                     COALESCE(NEW.iuran_3, 0) + 
                     COALESCE(NEW.iuran_4, 0) + 
                     COALESCE(NEW.iuran_5, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic total calculation (backup for generated column)
CREATE TRIGGER trigger_calculate_total_iuran
  BEFORE INSERT OR UPDATE ON public.iuran_submissions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_iuran();

-- Function to check monthly submission
CREATE OR REPLACE FUNCTION check_monthly_submission(
  p_user_id UUID,
  p_bulan_tahun DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.iuran_submissions 
    WHERE user_id = p_user_id 
    AND bulan_tahun = p_bulan_tahun
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_submissions_updated_at
  BEFORE UPDATE ON public.iuran_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID, but handle the case when it's the default/invalid UUID
  current_user_id := get_current_user_id();
  
  -- Skip audit logging if user ID is the default (system operations)
  IF current_user_id = '00000000-0000-0000-0000-000000000000'::UUID THEN
    -- For INSERT operations during initial setup, just return without logging
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Normal audit logging for authenticated users
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (current_user_id, TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (current_user_id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (current_user_id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user (only active users)
CREATE OR REPLACE FUNCTION authenticate_user(input_username TEXT, input_password TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role user_role
) AS $$
DECLARE
  user_record public.users%ROWTYPE;
BEGIN
  -- Find active user by username
  SELECT * INTO user_record 
  FROM public.users 
  WHERE users.username = input_username AND is_active = true;
  
  -- Check if user exists, is active, and password is correct
  IF user_record.id IS NOT NULL AND verify_password(input_password, user_record.password_hash) THEN
    -- Set user session for RLS
    PERFORM set_config('app.current_user_id', user_record.id::text, true);
    
    RETURN QUERY SELECT 
      user_record.id,
      user_record.username::TEXT,
      user_record.full_name::TEXT,
      user_record.role;
  ELSE
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add new user with soft delete and reconnection logic
CREATE OR REPLACE FUNCTION add_new_user(
  p_username TEXT,
  p_full_name TEXT,
  p_password TEXT,
  p_role user_role
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  created_at TIMESTAMP WITH TIME ZONE,
  is_reactivated BOOLEAN
) AS $$
DECLARE
  new_user_id UUID;
  existing_user_record public.users%ROWTYPE;
  user_record public.users%ROWTYPE;
  is_reactivation BOOLEAN := FALSE;
BEGIN
  -- Validate username format
  IF p_username !~ '^[a-zA-Z0-9._]+$' THEN
    RAISE EXCEPTION 'Username hanya boleh berisi huruf, angka, titik (.), dan underscore (_)';
  END IF;
  
  -- Check if username exists (including deleted users) - FIX: use table alias
  SELECT * INTO existing_user_record
  FROM public.users u 
  WHERE u.username = p_username;
  
  IF existing_user_record.id IS NOT NULL THEN
    -- If user exists and is active, throw error
    IF existing_user_record.is_active = true THEN
      RAISE EXCEPTION 'Username sudah digunakan oleh user aktif';
    ELSE
      -- Reactivate deleted user with new data
      UPDATE public.users 
      SET 
        full_name = p_full_name,
        password_hash = hash_password(p_password),
        role = p_role,
        is_active = true,
        deleted_at = NULL,
        updated_at = NOW()
      WHERE id = existing_user_record.id
      RETURNING id INTO new_user_id;
      
      is_reactivation := TRUE;
      
      -- Reconnect iuran submissions - FIX: use table alias
      UPDATE public.iuran_submissions s
      SET user_id = new_user_id
      WHERE s.username = p_username AND s.user_id != new_user_id;
    END IF;
  ELSE
    -- Insert new user
    INSERT INTO public.users (username, full_name, password_hash, role)
    VALUES (p_username, p_full_name, hash_password(p_password), p_role)
    RETURNING id INTO new_user_id;
  END IF;
  
  -- Get the final user record
  SELECT * INTO user_record 
  FROM public.users u
  WHERE u.id = new_user_id;
  
  -- Return the user data
  RETURN QUERY SELECT 
    user_record.id,
    user_record.username::TEXT,
    user_record.full_name::TEXT,
    user_record.role,
    user_record.created_at,
    is_reactivation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users 
  SET 
    is_active = false,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id AND role != 'superadmin'; -- Prevent deleting superadmin
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user with password
CREATE OR REPLACE FUNCTION update_user_with_password(
  p_user_id UUID,
  p_username TEXT,
  p_full_name TEXT,
  p_role user_role,
  p_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record public.users%ROWTYPE;
BEGIN
  -- Validate username format
  IF p_username !~ '^[a-zA-Z0-9._]+$' THEN
    RAISE EXCEPTION 'Username hanya boleh berisi huruf, angka, titik (.), dan underscore (_)';
  END IF;
  
  -- Check if username is already used by another user
  IF EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.username = p_username 
    AND u.id != p_user_id 
    AND u.is_active = true
  ) THEN
    RAISE EXCEPTION 'Username sudah digunakan oleh user lain';
  END IF;
  
  -- Update user data
  UPDATE public.users 
  SET 
    username = p_username,
    full_name = p_full_name,
    role = p_role,
    password_hash = hash_password(p_password),
    updated_at = NOW()
  WHERE id = p_user_id AND is_active = true
  RETURNING * INTO user_record;
  
  -- Check if user was found and updated
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User tidak ditemukan atau tidak aktif';
  END IF;
  
  -- Return the updated user data
  RETURN QUERY SELECT 
    user_record.id,
    user_record.username::TEXT,
    user_record.full_name::TEXT,
    user_record.role,
    user_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user without changing username
CREATE OR REPLACE FUNCTION update_user_without_username(
  p_user_id UUID,
  p_full_name TEXT,
  p_role user_role,
  p_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record public.users%ROWTYPE;
BEGIN
  -- Update user data (excluding username)
  UPDATE public.users 
  SET 
    full_name = p_full_name,
    role = p_role,
    password_hash = hash_password(p_password),
    updated_at = NOW()
  WHERE id = p_user_id AND is_active = true
  RETURNING * INTO user_record;
  
  -- Check if user was found and updated
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User tidak ditemukan atau tidak aktif';
  END IF;
  
  -- Return the updated user data
  RETURN QUERY SELECT 
    user_record.id,
    user_record.username::TEXT,
    user_record.full_name::TEXT,
    user_record.role,
    user_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active users only
CREATE OR REPLACE FUNCTION get_active_users()
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  full_name VARCHAR,
  role user_role,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY 
  SELECT u.id, u.username, u.full_name, u.role, u.created_at, u.updated_at
  FROM public.users u
  WHERE u.is_active = true
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard stats (only active users)
CREATE OR REPLACE FUNCTION get_dashboard_stats_active()
RETURNS TABLE (
  total_jamaah INTEGER,
  total_iuran_this_month DECIMAL,
  submission_this_month INTEGER,
  pending_submissions INTEGER
) AS $$
DECLARE
  current_month DATE;
BEGIN
  current_month := DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.users WHERE role != 'superadmin' AND is_active = true) as total_jamaah,
    COALESCE(SUM(s.total_iuran), 0) as total_iuran_this_month,
    COUNT(s.id)::INTEGER as submission_this_month,
    ((SELECT COUNT(*) FROM public.users WHERE role != 'superadmin' AND is_active = true) - COUNT(s.id))::INTEGER as pending_submissions
  FROM public.iuran_submissions s
  INNER JOIN public.users u ON s.user_id = u.id AND u.is_active = true
  WHERE DATE_TRUNC('month', s.bulan_tahun) = current_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default SUPERADMIN user
INSERT INTO public.users (username, full_name, password_hash, role)
VALUES (
  'ZulfaNurhuda',
  'Zulfa Nurhuda',
  hash_password('Zn.9192631770'),
  'superadmin'
);

-- Create audit triggers AFTER inserting the SUPERADMIN user
-- This prevents foreign key constraint errors during initial setup
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_submissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.iuran_submissions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add missing functions for completeness
CREATE OR REPLACE FUNCTION delete_iuran_submission(p_submission_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.iuran_submissions 
  WHERE id = p_submission_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for exports (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('exports', 'exports', false);

-- Storage policy for exports (optional - if you want to use Supabase Storage)
-- CREATE POLICY "Admin can upload exports" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'exports' AND
--     (SELECT role FROM public.users WHERE id = get_current_user_id()) IN ('superadmin', 'admin')
--   );