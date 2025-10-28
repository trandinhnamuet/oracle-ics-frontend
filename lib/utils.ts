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
  // return roundedUp;  
  return amount; 

}

/**
 * In ra các biến môi trường client-side (NEXT_PUBLIC_*)
 * Có thể gọi từ console trình duyệt: printEnv()
 */
export function printEnv() {
  const env: Record<string, string | undefined> = {};
  
  // Chỉ lấy các biến môi trường NEXT_PUBLIC_* (có thể truy cập từ client)
  if (typeof window !== 'undefined') {
    console.log('🔍 Debug process.env:', process.env);
    
    for (const key in process.env) {
      if (key.startsWith('NEXT_PUBLIC_')) {
        env[key] = process.env[key];
      }
    }
    
    // Thử truy cập trực tiếp
    const directAccess = process.env.NEXT_PUBLIC_API_URL;
    console.log('🎯 Direct access NEXT_PUBLIC_API_URL:', directAccess);
    
    console.log('🌍 Client Environment Variables:', env);
    console.log('📝 Tip: Only NEXT_PUBLIC_* variables are accessible on client side');
    return env;
  } else {
    console.log('❌ printEnv() should be called on client side only');
    return {};
  }
}

/**
 * In ra thông tin user hiện tại đang đăng nhập
 * Có thể gọi từ console trình duyệt: userInfo()
 */
export function userInfo() {
  if (typeof window !== 'undefined') {
    try {
      // Truy cập zustand store từ window object
      const authStore = (window as any).useAuthStore?.getState?.();
      if (authStore) {
        const { user, token, isAuthenticated, isLoading, error } = authStore;
        console.log('👤 Current User Info:', user);
        console.log('   🔐 Authenticated:', isAuthenticated);
        if (user) {
          console.log('   🆔 ID:', user.id);
          console.log('   📧 Email:', user.email);
          console.log('   👤 First Name:', user.firstName);
          console.log('   👤 Last Name:', user.lastName);
          console.log('   📱 Phone:', user.phoneNumber);
          console.log('   🏢 Company:', user.company);
          console.log('   🏷️  Role:', user.role);
          console.log('   ✅ isActive:', user.isActive);
          console.log('   🖼️  Avatar:', user.avatar);
          console.log('   🕒 Created At:', user.createdAt);
          console.log('   🕒 Updated At:', user.updatedAt);
        } else {
          console.log('   📧 User Data: null');
        }
        console.log('   🎫 Token:', token ? `${token.substring(0, 20)}...` : 'No token');
        console.log('   ⏳ Loading:', isLoading);
        console.log('   ❌ Error:', error);
        // Thông tin từ cookies
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];
        console.log('   🍪 Cookie Token:', cookieToken ? `${cookieToken.substring(0, 20)}...` : 'No cookie token');
        // Thông tin từ localStorage
        const localStorageAuth = localStorage.getItem('auth-storage');
        console.log('   💾 LocalStorage Auth:', localStorageAuth ? JSON.parse(localStorageAuth) : 'No localStorage data');
        return {
          user,
          token,
          isAuthenticated,
          isLoading,
          error,
          cookieToken,
          localStorageAuth: localStorageAuth ? JSON.parse(localStorageAuth) : null
        };
      } else {
        console.log('❌ Auth store not found. Make sure useAuthStore is exposed on window.');
        return null;
      }
    } catch (err) {
      console.error('❌ Error getting user info:', err);
      return null;
    }
  } else {
    console.log('❌ userInfo() should be called on client side only');
    return null;
  }
}
