import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price consistently for both server and client
export function formatPrice(price: string | number): string {
  if (typeof price === 'string' && price === "Liên hệ") {
    return price
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  // Round to nearest integer and format with comma as thousand separator
  return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
