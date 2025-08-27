/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan tipe data dan interface TypeScript inti yang digunakan di seluruh aplikasi.
 */

/**
 * @type UserRole
 * @description Mendefinisikan peran (role) yang mungkin untuk seorang pengguna.
 * - `superadmin`: Memiliki semua hak akses.
 * - `admin`: Memiliki hak akses administratif.
 * - `jamaah`: Pengguna biasa.
 */
export type UserRole = 'superadmin' | 'admin' | 'jamaah';

/**
 * @interface User
 * @description Merepresentasikan objek pengguna.
 * @property {string} id - Pengidentifikasi unik untuk pengguna.
 * @property {string} username - Nama pengguna.
 * @property {string} full_name - Nama lengkap pengguna.
 * @property {UserRole} role - Peran pengguna.
 * @property {string} created_at - Timestamp kapan pengguna dibuat.
 * @property {string} updated_at - Timestamp kapan pengguna terakhir diperbarui.
 */
export interface User {
    id: string;
    username: string;
    full_name: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

/**
 * @interface IuranSubmission
 * @description Merepresentasikan satu entri pengumpulan iuran.
 * @property {string} id - Pengidentifikasi unik untuk entri.
 * @property {string} user_id - ID pengguna yang membuat entri.
 * @property {string} nama_jamaah - Nama jamaah yang iurannya dikumpulkan.
 * @property {string} bulan_tahun - Bulan dan tahun pengumpulan (contoh: "2023-12").
 * @property {string} timestamp_submitted - Timestamp kapan entri dibuat.
 * @property {number} iuran_1 - Jumlah untuk jenis iuran pertama.
 * @property {number} iuran_2 - Jumlah untuk jenis iuran kedua.
 * @property {number} iuran_3 - Jumlah untuk jenis iuran ketiga.
 * @property {number} iuran_4 - Jumlah untuk jenis iuran keempat.
 * @property {number} iuran_5 - Jumlah untuk jenis iuran kelima.
 * @property {number} total_iuran - Jumlah total dari semua iuran.
 * @property {string} created_at - Timestamp kapan record dibuat.
 * @property {string} updated_at - Timestamp kapan record terakhir diperbarui.
 */
export interface IuranSubmission {
    id: string;
    user_id: string;
    /* Opsional: disimpan untuk denormalisasi/pencarian cepat */
    username?: string;
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

/**
 * @interface AuditLog
 * @description Merepresentasikan entri log audit untuk melacak perubahan.
 * @property {string} id - Pengidentifikasi unik untuk entri log.
 * @property {string} user_id - ID pengguna yang melakukan aksi.
 * @property {string} action - Aksi yang dilakukan (contoh: "INSERT", "UPDATE", "DELETE").
 * @property {string} table_name - Nama tabel yang terpengaruh.
 * @property {string} [record_id] - ID record yang terpengaruh.
 * @property {Record<string, unknown>} [old_values] - Nilai lama dari record (untuk aksi UPDATE).
 * @property {Record<string, unknown>} [new_values] - Nilai baru dari record (untuk aksi INSERT dan UPDATE).
 * @property {string} timestamp - Timestamp kapan aksi terjadi.
 */
export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    table_name: string;
    record_id?: string;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    timestamp: string;
}

/**
 * @interface IuranFormData
 * @description Merepresentasikan struktur data untuk form iuran.
 * @property {number} iuran_1 - Jumlah untuk jenis iuran pertama.
 * @property {number} iuran_2 - Jumlah untuk jenis iuran kedua.
 * @property {number} iuran_3 - Jumlah untuk jenis iuran ketiga.
 * @property {number} iuran_4 - Jumlah untuk jenis iuran keempat.
 * @property {number} iuran_5 - Jumlah untuk jenis iuran kelima.
 */
export interface IuranFormData {
    iuran_1: number;
    iuran_2: number;
    iuran_3: number;
    iuran_4: number;
    iuran_5: number;
}

/**
 * @interface ExportFormat
 * @description Merepresentasikan struktur data untuk mengekspor data iuran.
 * @property {'xlsx' | 'csv' | 'xml' | 'json'} format - Format file untuk ekspor.
 * @property {string} filename - Nama file yang akan diekspor.
 * @property {IuranSubmission[]} data - Data iuran yang akan diekspor.
 */
export interface ExportFormat {
    format: 'xlsx' | 'csv' | 'xml' | 'json';
    filename: string;
    data: IuranSubmission[];
}

/**
 * @interface DashboardStats
 * @description Merepresentasikan statistik yang ditampilkan di dashboard.
 * @property {number} totalJamaah - Jumlah total jamaah.
 * @property {number} totalIuranThisMonth - Total iuran yang terkumpul bulan ini.
 * @property {number} submissionThisMonth - Jumlah pengumpulan iuran bulan ini.
 * @property {number} pendingSubmissions - Jumlah pengumpulan yang masih tertunda.
 */
export interface DashboardStats {
    totalJamaah: number;
    totalIuranThisMonth: number;
    submissionThisMonth: number;
    pendingSubmissions: number;
}
