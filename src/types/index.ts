export type UserRole = 'superadmin' | 'admin' | 'jamaah';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface IuranSubmission {
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
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  timestamp: string;
}

export interface IuranFormData {
  iuran_1: number;
  iuran_2: number;
  iuran_3: number;
  iuran_4: number;
  iuran_5: number;
}

export interface ExportFormat {
  format: 'xlsx' | 'csv' | 'xml' | 'json';
  filename: string;
  data: any[];
}

export interface DashboardStats {
  totalJamaah: number;
  totalIuranThisMonth: number;
  submissionThisMonth: number;
  pendingSubmissions: number;
}