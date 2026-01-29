import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Indian Rupees (INR) with Lakhs and Crores notation
 * @param price - Price in rupees
 * @returns Formatted string like "₹90.00 L" or "₹1.20 Cr"
 */
export function formatPrice(price?: number | null): string {
  if (!price || price <= 0) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}
