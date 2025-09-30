import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Danh sách các routes cần đăng nhập
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/settings',
  '/admin'
]

// Danh sách các routes chỉ dành cho guest (chưa đăng nhập)
const guestOnlyRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value
  
  // Kiểm tra xem route có cần authentication không
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Kiểm tra xem route có phải guest-only không
  const isGuestOnlyRoute = guestOnlyRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Nếu là protected route và không có token
  if (isProtectedRoute && !token) {
    // Nếu là /admin hoặc /admin/* thì redirect sang /unauthorized
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    // Các route khác vẫn về /login như cũ
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Nếu là guest-only route và đã có token
  if (isGuestOnlyRoute && token) {
    // Redirect về trang chủ kèm message
    const homeUrl = new URL('/', request.url);
    homeUrl.searchParams.set('message', 'logged-in');
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next()
}

// Cấu hình matcher để middleware chỉ chạy cho các routes cần thiết
export const config = {
  matcher: [
    // Bao gồm tất cả routes trừ các file static
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}