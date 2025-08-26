"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className,
  buttonClassName,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useMemo(
    () => `glass-select-${Math.random().toString(36).slice(2)}`,
    []
  );

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      // set initial highlight to current selected
      const idx = options.findIndex((o) => o.value === value);
      setHighlightIndex(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  function commitChange(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  }

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
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          onKeyDown(e);
        }}
        disabled={disabled}
        className={clsx(
          // base glass look aligned with .glass-input/.glass-select
          "glass-input w-full flex items-center justify-between gap-2 px-3 py-2",
          "pr-9 text-left",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span className={clsx(
          "truncate",
          !selected && "text-gray-500 dark:text-gray-300"
        )}>{
          selected ? selected.label : placeholder
        }</span>
        <ChevronDown className="absolute right-2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </button>

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
            const selected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => commitChange(idx)}
                className={clsx(
                  "px-3 py-2 text-sm glass-dropdown-item",
                  selected && "font-semibold",
                  active
                    ? "bg-blue-500/20 dark:bg-blue-500/20"
                    : undefined
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
