import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function parseCurrency(value: string): number {
  // Remove all non-digit characters except comma (decimal) and minus
  const cleaned = value.replace(/[^\d,-]/g, '');
  
  // Handle empty string
  if (!cleaned) return 0;
  
  // In Indonesian format: dots are thousand separators, comma is decimal
  // But since we're working with integers (no decimals for currency), just remove all separators
  const result = cleaned.replace(/[.,]/g, '');
  
  const parsed = parseInt(result, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getCurrentMonthYear(): Date {
  const now = new Date();
  // Create date in local timezone to avoid UTC conversion issues
  const year = now.getFullYear();
  const month = now.getMonth();
  return new Date(year, month, 1);
}

export function getCurrentMonthYearString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
  return `${year}-${month}-01`;
}