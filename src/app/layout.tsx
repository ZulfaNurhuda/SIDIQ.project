import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "SIDIQ - Sistem Informasi Pengelolaan Data Infaq",
  description: "SIDIQ (Sistem Informasi Pengelolaan Data Infaq) - Kelompok 3 - Jatiluhur - Sistem pengelolaan iuran anggota jamaah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`font-lexend antialiased ${lexend.variable}`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
