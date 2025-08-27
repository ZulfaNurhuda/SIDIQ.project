/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mengkonfigurasi PostCSS, sebuah alat untuk mengubah CSS dengan plugin JavaScript.
 * Biasanya digunakan bersama dengan Tailwind CSS dan Autoprefixer.
 */

module.exports = {
    plugins: {
        /* Plugin Tailwind CSS untuk PostCSS. Ini memproses direktif Tailwind dan menghasilkan CSS. */
        tailwindcss: {},
        /* Plugin Autoprefixer untuk PostCSS. Ini menambahkan awalan vendor ke aturan CSS. */
        autoprefixer: {},
    },
};