# Setup Instructions - SIDIQ (Sistem Informasi Pengelolaan Data Infaq)

## Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase

## 1. Clone dan Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd sidiq-project

# Install dependencies
npm install
```

## 2. Environment Setup

1. Copy `.env.example` ke `.env.local`
2. Isi variabel environment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Next.js Configuration  
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 3. Supabase Setup

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor di dashboard Supabase
3. Copy dan jalankan semua SQL dari file `supabase-setup.sql`
4. User SUPERADMIN sudah otomatis dibuat melalui SQL script dengan:
   - Username: `ZulfaNurhuda`
   - Password: `Zn.9192631770`
   - Role: `superadmin`

**Catatan Penting tentang Authentication**: 
- Sistem ini TIDAK menggunakan Supabase Auth
- Authentication custom dengan username + password (tanpa email)
- Password di-hash menggunakan bcrypt melalui pgcrypto extension
- User didaftarkan oleh ADMIN/SUPERADMIN, bukan self-registration
- Sistem eksklusif - hanya user yang didaftarkan yang bisa login

## 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 5. Login

- Username: `ZulfaNurhuda`
- Password: `Zn.9192631770`

## Features Utama

✅ **Custom Authentication System**
- Username + Password (tanpa email)
- Role-based access control (SUPERADMIN, ADMIN, JAMAAH)
- Bcrypt password hashing
- Secure session management
- Eksklusif - user didaftarkan oleh admin

✅ **Admin Dashboard**
- Statistics overview
- User management (create, delete users)
- Data export (XLSX, CSV, JSON, XML)
- Role-based permissions

✅ **Jamaah Interface**
- Form iuran bulanan
- One submission per month logic
- Edit capability untuk update iuran
- Payment history lengkap

✅ **Modern UI/UX**
- Glassmorphism design effects
- Dark/Light mode toggle
- Fully responsive (mobile-first)
- Font Lexend untuk optimal readability

✅ **Data Management**
- PostgreSQL dengan Supabase
- Row Level Security (RLS)
- Audit logging untuk tracking
- Data persistence & backup ready
- Multi-format export functionality

## Troubleshooting

### Authentication Issues
- Pastikan Supabase URL dan keys sudah benar
- Periksa RLS policies sudah aktif
- Pastikan pgcrypto extension sudah diaktifkan
- Cek apakah fungsi `authenticate_user` sudah dibuat
- Pastikan SUPERADMIN user sudah ter-insert dengan benar

### Database Issues
- Pastikan semua tables sudah dibuat
- Periksa RLS policies
- Pastikan triggers sudah aktif

### UI Issues
- Clear browser cache
- Periksa Tailwind CSS configuration
- Pastikan fonts ter-load dengan benar

## Production Deployment

1. Build aplikasi:
```bash
npm run build
```

2. Deploy ke platform pilihan (Vercel, Netlify, dll)
3. Set environment variables di platform hosting
4. Update Supabase URL di production settings

## Support

Untuk bantuan dan bug reports, buat issue di repository GitHub.