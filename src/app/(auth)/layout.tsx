/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan layout untuk halaman-halaman terkait otentikasi (misalnya, login).
 */

/**
 * @function AuthLayout
 * @description Komponen layout sederhana yang membungkus halaman otentikasi.
 * Dalam kasus ini, tidak menambahkan elemen UI spesifik, tetapi berfungsi sebagai pengelompokan struktural untuk rute otentikasi.
 * @param {{ children: React.ReactNode }} props - Properti untuk komponen.
 * @returns {JSX.Element} Node children yang diteruskan ke layout.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* Layout ini tidak menambahkan elemen UI apa pun, hanya berfungsi sebagai pembungkus. */
    return <>{children}</>;
}