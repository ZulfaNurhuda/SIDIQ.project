/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini mendefinisikan komponen Select (dropdown) kustom yang mudah diakses.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/**
 * @type Option
 * @description Mendefinisikan bentuk (shape) dari satu item dalam daftar pilihan.
 * @property {string} label - Teks yang ditampilkan kepada pengguna.
 * @property {string} value - Nilai aktual yang terkait dengan opsi.
 */
type Option = {
    label: string;
    value: string;
};

/**
 * @interface SelectProps
 * @description Mendefinisikan properti untuk komponen Select.
 * @property {Option[]} options - Daftar opsi untuk ditampilkan di dropdown.
 * @property {string} value - Nilai yang saat ini dipilih.
 * @property {(value: string) => void} onChange - Fungsi callback saat opsi baru dipilih.
 * @property {string} [placeholder='Pilih...'] - Teks placeholder yang ditampilkan saat tidak ada nilai yang dipilih.
 * @property {string} [className] - Kelas CSS tambahan untuk kontainer utama.
 * @property {string} [buttonClassName] - Kelas CSS tambahan untuk tombol pemicu.
 * @property {boolean} [disabled=false] - Apakah komponen select dinonaktifkan.
 */
type SelectProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    disabled?: boolean;
};

/**
 * @function Select
 * @description Komponen select kustom yang mudah diakses dengan gaya glassmorphism.
 * Mengelola state sendiri untuk membuka/menutup, navigasi keyboard, dan klik di luar.
 * @param {SelectProps} props - Properti untuk komponen.
 * @returns {JSX.Element} Komponen select yang telah dirender.
 */
export function Select({
    options,
    value,
    onChange,
    placeholder = "Pilih...",
    className,
    buttonClassName,
    disabled = false,
}: SelectProps) {
    /* State untuk mengelola status buka/tutup dropdown. */
    const [open, setOpen] = useState(false);
    /* State untuk melacak opsi yang disorot saat ini untuk navigasi keyboard. */
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    /* Ref ke div kontainer utama untuk mendeteksi klik di luar. */
    const containerRef = useRef<HTMLDivElement>(null);
    /* ID unik untuk menghubungkan tombol ke listbox untuk aksesibilitas (aria-controls). */
    const listboxId = useMemo(
        () => `glass-select-${Math.random().toString(36).slice(2)}`,
        []
    );

    /* Cari objek opsi lengkap untuk nilai yang saat ini dipilih. */
    const selected = options.find((o) => o.value === value);

    /* Efek untuk menangani klik di luar komponen untuk menutup dropdown. */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* Efek untuk mengatur sorotan awal pada opsi saat dropdown dibuka. */
    useEffect(() => {
        if (open) {
            const idx = options.findIndex((o) => o.value === value);
            setHighlightIndex(idx >= 0 ? idx : 0);
        }
    }, [open, options, value]);

    /**
     * @function commitChange
     * @description Menerapkan pemilihan opsi baru.
     * @param {number} idx - Indeks opsi yang akan dipilih.
     */
    function commitChange(idx: number) {
        const opt = options[idx];
        if (!opt) return;
        onChange(opt.value);
        setOpen(false);
    }

    /**
     * @function onKeyDown
     * @description Menangani navigasi keyboard di dalam komponen select (Tombol Panah, Enter, Escape).
     * @param {React.KeyboardEvent<HTMLButtonElement>} e - Event keyboard.
     */
    function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
            return;
        }
        if (!open) return;
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((i) => Math.min(options.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((i) => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            commitChange(highlightIndex);
        }
    }

    return (
        <div ref={containerRef} className={clsx("relative", className)}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => !disabled && setOpen((o) => !o)}
                onKeyDown={(e) => !disabled && onKeyDown(e)}
                disabled={disabled}
                className={clsx(
                    "glass-input w-full flex items-center justify-between gap-2 px-3 py-2",
                    "pr-9 text-left",
                    disabled && "opacity-50 cursor-not-allowed",
                    buttonClassName
                )}
            >
                <span className={clsx("truncate", !selected && "text-gray-500 dark:text-gray-300")}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className="absolute right-2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            </button>

            {/* Daftar dropdown, dirender secara kondisional. */}
            {open && !disabled && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className={clsx(
                        "absolute z-50 mt-2 w-full max-h-60 overflow-auto",
                        "glass-dropdown animate-slide-up",
                    )}
                >
                    {options.map((opt, idx) => {
                        const active = idx === highlightIndex;
                        const isSelected = opt.value === value;
                        return (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                onClick={() => commitChange(idx)}
                                className={clsx(
                                    "px-3 py-2 text-sm glass-dropdown-item",
                                    isSelected && "font-semibold",
                                    active && "bg-blue-500/20 dark:bg-blue-500/20"
                                )}
                            >
                                {opt.label}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}