/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mengkonfigurasi ESLint untuk proyek, termasuk aturan spesifik Next.js dan TypeScript.
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

/* Dapatkan ekuivalen __filename dan __dirname untuk modul ES. */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Inisialisasi FlatCompat untuk kompatibilitas dengan konfigurasi ESLint lama. */
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

/* Definisikan array konfigurasi ESLint. */
const eslintConfig = [
    /* Perluas konfigurasi yang direkomendasikan untuk Next.js core web vitals dan TypeScript. */
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        /* Tentukan file dan direktori yang akan diabaikan selama linting. */
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ],
    },
    {
        /* Definisikan aturan ESLint kustom untuk proyek. */
        rules: {
            /* Peringatkan tentang variabel yang tidak digunakan di TypeScript. */
            "@typescript-eslint/no-unused-vars": "warn",
            /* Peringatkan tentang penggunaan tipe 'any' di TypeScript. */
            "@typescript-eslint/no-explicit-any": "warn",
            /* Peringatkan tentang entitas yang tidak di-escape di komponen React. */
            "react/no-unescaped-entities": "warn",
            /* Peringatkan tentang penggunaan font kustom langsung di halaman (lebih suka _document.js atau CSS global). */
            "@next/next/no-page-custom-font": "warn",
        },
    },
];

/* Ekspor konfigurasi ESLint. */
export default eslintConfig;