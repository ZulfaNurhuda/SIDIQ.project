/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan halaman error global untuk menangani error yang terjadi di root layout.
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * @interface GlobalErrorProps
 * @description Properti untuk komponen GlobalError.
 * @property {Error & { digest?: string }} error - Object error yang terjadi.
 * @property {() => void} reset - Function untuk reset error boundary.
 */
interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * @function GlobalError
 * @description Komponen global error handler dengan desain minimal dan fungsional.
 * Menangani error kritikal yang terjadi di level root layout.
 * @param {GlobalErrorProps} props - Properti error dan reset function.
 * @returns {JSX.Element} Halaman error global yang dirender.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="id">
            <body>
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
                        {/* Error Icon */}
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>

                        {/* Error Content */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Aplikasi Bermasalah
                            </h1>
                            <p className="text-gray-600 leading-relaxed">
                                Maaf, terjadi kesalahan kritikal pada aplikasi. 
                                Tim teknis telah diberitahu dan sedang menangani masalah ini.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={reset}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Coba Lagi</span>
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>Kembali ke Beranda</span>
                            </button>
                        </div>

                        {/* Error Details */}
                        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                            <p>Error Code: GLOBAL_ERROR</p>
                            {error.digest && <p>ID: {error.digest}</p>}
                            {process.env.NODE_ENV === 'development' && (
                                <details className="text-left mt-2">
                                    <summary className="cursor-pointer hover:text-gray-700">
                                        Detail Error (Development)
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
                                        {error.stack || error.message}
                                    </pre>
                                </details>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="text-xs text-gray-400">
                            Jika masalah terus berlanjut, hubungi administrator sistem
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}