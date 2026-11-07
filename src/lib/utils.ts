import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPaiseToINR } from "./money";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from "./money";
export * from "./date";

/**
 * Format currency utility. Defaults to treating amount as paise integers.
 */
export function formatCurrency(amountPaise: number, showDecimals: boolean = false): string {
  return formatPaiseToINR(amountPaise, showDecimals);
}
