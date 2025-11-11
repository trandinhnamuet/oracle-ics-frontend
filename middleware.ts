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
  const token = request.cookies.get('access_token')?.value
  let userRole = null;
  
  // Xử lý ngôn ngữ để tránh hydration mismatch
  const response = NextResponse.next()
  const currentLanguage = request.cookies.get('language')?.value
  
  // Nếu chưa có cookie ngôn ngữ, set mặc định là 'vi'
  if (!currentLanguage) {
    response.cookies.set('language', 'vi', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 năm
      sameSite: 'lax'
    })
  }
  
  // Nếu có token, decode để lấy role
  if (token) {
    try {
      // JWT: header.payload.signature
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
        userRole = decoded.role;
        console.log(`Middleware: User ${decoded.email} with role ${userRole} accessing ${pathname}`);
      }
    } catch (e) {
      console.log('Middleware: Invalid JWT token');
      userRole = null;
    }
  }
  
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
      const unauthorizedResponse = NextResponse.redirect(new URL('/unauthorized', request.url));
      // Giữ nguyên cookie ngôn ngữ khi redirect
      if (currentLanguage) {
        unauthorizedResponse.cookies.set('language', currentLanguage, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax'
        })
      }
      return unauthorizedResponse;
    }
    // Các route khác vẫn về /login như cũ
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    const loginResponse = NextResponse.redirect(loginUrl)
    // Giữ nguyên cookie ngôn ngữ khi redirect
    if (currentLanguage) {
      loginResponse.cookies.set('language', currentLanguage, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      })
    }
    return loginResponse
  }

  // Nếu đã đăng nhập nhưng vào /admin mà không phải admin thì redirect unauthorized
  if (token && pathname.startsWith('/admin') && userRole !== 'admin') {
    const unauthorizedResponse = NextResponse.redirect(new URL('/unauthorized', request.url));
    // Giữ nguyên cookie ngôn ngữ khi redirect
    if (currentLanguage) {
      unauthorizedResponse.cookies.set('language', currentLanguage, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      })
    }
    return unauthorizedResponse;
  }
  
  // Nếu là guest-only route và đã có token
  if (isGuestOnlyRoute && token) {
    // Kiểm tra token có hợp lệ không
    let isValidToken = false
    try {
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
        const now = Math.floor(Date.now() / 1000)
        // Token hợp lệ nếu chưa hết hạn
        isValidToken = decoded.exp && decoded.exp > now
      }
    } catch (e) {
      isValidToken = false
    }
    
    if (!isValidToken) {
      // Token không hợp lệ hoặc hết hạn - xóa và cho phép truy cập guest route
      const response = NextResponse.next()
      response.cookies.delete('access_token')
      // Giữ nguyên cookie ngôn ngữ
      if (currentLanguage) {
        response.cookies.set('language', currentLanguage, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax'
        })
      }
      return response
    } else {
      // Token hợp lệ - redirect về trang chủ kèm message
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('message', 'logged-in');
      const redirectResponse = NextResponse.redirect(homeUrl);
      // Giữ nguyên cookie ngôn ngữ khi redirect
      if (currentLanguage) {
        redirectResponse.cookies.set('language', currentLanguage, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax'
        })
      }
      return redirectResponse;
    }
  }
  
  return response
}

// Cấu hình matcher để middleware chỉ chạy cho các routes cần thiết
export const config = {
  matcher: [
    // Bao gồm tất cả routes trừ các file static
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}