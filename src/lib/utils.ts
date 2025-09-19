import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBalance(balance: string | number, maxDecimals: number = 6): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0.00';
  
  // For very small numbers, show more precision
  if (num < 0.001) {
    return num.toFixed(Math.min(maxDecimals, 8));
  }
  // For small numbers, show moderate precision
  if (num < 1) {
    return num.toFixed(Math.min(maxDecimals, 6));
  }
  // For larger numbers, show fewer decimals
  if (num < 1000) {
    return num.toFixed(Math.min(maxDecimals, 4));
  }
  // For very large numbers, show minimal decimals
  return num.toFixed(Math.min(maxDecimals, 2));
}
