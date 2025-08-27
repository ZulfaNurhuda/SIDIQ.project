import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable Supabase Auth since we use custom auth
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          role: 'superadmin' | 'admin' | 'jamaah';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          role?: 'superadmin' | 'admin' | 'jamaah';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          role?: 'superadmin' | 'admin' | 'jamaah';
          created_at?: string;
          updated_at?: string;
        };
      };
      iuran_submissions: {
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
      audit_logs: {
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
