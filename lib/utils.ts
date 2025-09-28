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

/**
 * Làm tròn số tiền về hàng nghìn (000), mặc định làm tròn lên,
 * nhưng nếu làm tròn lên khiến hàng chục nghìn (0000) tăng 1 thì làm tròn xuống.
 * @param amount Số tiền cần làm tròn
 * @returns Số tiền đã làm tròn
 */
export function roundMoney(amount: number): number {
  const roundedUp = Math.ceil(amount / 1000) * 1000;
  const roundedDown = Math.floor(amount / 1000) * 1000;
  // Nếu làm tròn lên khiến hàng 0000 tăng 1, thì làm tròn xuống
  const upTenThousands = Math.floor(roundedUp / 10000);
  const curTenThousands = Math.floor(amount / 10000);
  if (upTenThousands > curTenThousands) {
    return roundedDown;
  }
  return roundedUp;
}
