/**
 * Import modul yang diperlukan
 * fs: untuk operasi file system
 * path: untuk manipulasi path file/folder
 */
const fs = require('fs');
const path = require('path');

/* Mengambil argumen dari command line, mengabaikan 2 argumen pertama (node dan nama file) */
const toRemove = process.argv.slice(2);

/**
 * Validasi input dari user
 * Jika tidak ada folder yang ditentukan, tampilkan pesan error dan hentikan program
 */
if (toRemove.length === 0) {
    console.error('Harap tentukan setidaknya satu folder untuk dihapus, misalnya: \"node CLEAN.js .next .turbo\".');
    process.exit(1);
}

/* Menggunakan rmSync jika tersedia (Node.js versi baru), jika tidak gunakan rmdirSync */
const rm = fs.rmSync ? fs.rmSync : fs.rmdirSync;

/* Flag untuk melacak apakah terjadi error selama proses penghapusan */
let hadError = false;

/**
 * Iterasi setiap folder yang akan dihapus
 * t: nama folder yang akan dihapus
 */
for (const t of toRemove) {
    /* Mendapatkan path absolut dari folder */
    const p = path.resolve(process.cwd(), t);
    
    try {
        /* Cek apakah folder ada sebelum dihapus */
        const existed = fs.existsSync(p);
        
        /* Hapus folder secara rekursif dan paksa */
        rm(p, { recursive: true, force: true });
        
        /* Tampilkan pesan sukses atau dilewati */
        console.log(`${existed ? 'Berhasil dihapus' : 'Dilewati (folder tidak ditemukan)'}: ${t}`);
    } catch (e) {
        /* Tangkap error jika terjadi masalah saat penghapusan */
        hadError = true;
        console.error(`Gagal menghapus folder ${t}, detail:`, e && e.message ? e.message : e);
    }
}

/**
 * Tampilkan pesan sukses dan akhiri program
 * Jika terjadi error, exit code 1
 * Jika sukses, exit code 0
 */
console.log('Berhasil membersihkan artefak build.');
process.exit(hadError ? 1 : 0);