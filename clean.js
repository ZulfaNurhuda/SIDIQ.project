/**
 * @project SIDIQ.project
 * @author  ZulfaNurhuda
 * @github  https://github.com/ZulfaNurhuda/SIDIQ.project
 * @file    clean.js
 * @description
 *  Skrip utilitas sederhana untuk membersihkan artefak build atau cache.
 *  Dapat dipanggil dari CLI untuk menghapus satu atau lebih folder target
 *  secara rekursif dan paksa. Menggunakan `fs.rmSync` bila tersedia (Node.js ≥ 14.14)
 *  dan fallback ke `fs.rmdirSync` pada versi yang lebih lama.
 *
 *  Contoh penggunaan:
 *    - node clean.js .next .turbo dist         \* Hapus folder build Next.js, Turbo, dan dist *\
 *    - node clean.js coverage tmp              \* Hapus folder coverage dan tmp *\
 *
 *  Catatan keamanan:
 *    - Pastikan argumen mengarah ke direktori yang aman untuk dihapus.
 *    - Skrip ini TIDAK memvalidasi apakah target berada di dalam workspace proyek.
 *      Gunakan dengan hati-hati agar tidak menghapus folder penting di luar proyek.
 */

/* Import modul Node.js untuk operasi filesystem & path */
const fs = require('fs'); /* Operasi file & folder sinkron/async */
const path = require('path'); /* Normalisasi & resolusi path lintas OS */

/* Ambil semua argumen setelah `node clean.js` sebagai daftar target penghapusan */
const toRemove = process.argv.slice(2); /* Array nama/path folder yang akan dihapus */

/**
 * Validasi input dari user.
 * Jika tidak ada target yang diberikan, tampilkan instruksi singkat dan keluar dengan status 1.
 */
if (toRemove.length === 0) {
    console.error('Harap tentukan setidaknya satu folder untuk dihapus, misalnya: "node clean.js .next .turbo".'); /* Pesan kesalahan input */
    process.exit(1); /* Keluar dengan kode error */
}

/* Pilih API penghapusan yang tersedia: rmSync (baru) atau rmdirSync (lama) */
const rm = fs.rmSync ? fs.rmSync /* Node ≥ 14.14 */ : fs.rmdirSync /* Fallback */;

/* Penanda global untuk mengetahui apakah ada kegagalan penghapusan */
let hadError = false; /* true jika salah satu penghapusan gagal */

/**
 * Iterasi setiap argumen target dan hapus jika ada.
 * Gunakan path absolut berdasarkan direktori kerja saat ini agar perintah konsisten
 * dari lokasi mana pun skrip ini dipanggil.
 */
for (const t of toRemove) { /* t = path relatif/absolut yang diminta pengguna */
    /* Bentuk path absolut dari target berdasarkan CWD */
    const p = path.resolve(process.cwd(), t); /* Path absolut target */

    try {
        /* Periksa eksistensi target untuk menentukan pesan yang akan ditampilkan */
        const existed = fs.existsSync(p); /* true jika folder ada saat dicek */

        /* Eksekusi penghapusan direktori secara rekursif dan paksa */
        rm(p, { recursive: true, force: true }); /* Hapus aman: tidak error jika tidak ada */

        /* Laporkan hasil: dihapus bila ada, dilewati bila tidak ditemukan */
        console.log(`${existed ? 'Berhasil dihapus' : 'Dilewati (folder tidak ditemukan)'}: ${t}`); /* Umpan balik pengguna */
    } catch (e) {
        /* Tangani kegagalan (misalnya izin file, file terkunci, path tidak valid) */
        hadError = true; /* Tandai bahwa setidaknya satu operasi gagal */
        console.error(`Gagal menghapus folder ${t}, detail:`, e && e.message ? e.message : e); /* Log detail error */
    }
}

/**
 * Ringkasan akhir dan kode keluar proses.
 * - 0: semua operasi sukses atau target tidak ditemukan (dilewati)
 * - 1: terdapat setidaknya satu kegagalan saat menghapus
 */
console.log('Berhasil membersihkan artefak build.\n'); /* Pesan akhir umum */
process.exit(hadError ? 1 : 0); /* Tentukan exit code berdasarkan hadError */
