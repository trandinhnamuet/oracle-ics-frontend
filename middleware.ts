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
// NOTE: /login và /register được bỏ khỏi đây vì login page đã tự xử lý redirect
// client-side. Middleware chặn bằng refreshToken HttpOnly cookie gây bug khi cookie
// chưa được xóa kịp sau logout (cookie HttpOnly chỉ server mới thấy được).
const guestOnlyRoutes: string[] = []

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // The refresh token itself is scoped to /api/auth and is deliberately NOT sent
  // to page routes, so this reads the companion session-hint cookie instead: a
  // site-wide marker holding only the role, never a token. Same trust level as
  // before (see the note below) with nothing sensitive exposed on these paths.
  const sessionHint = request.cookies.get('sessionHint')?.value
  let userRole = sessionHint || null;
  
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
  
  // SECURITY NOTE:
  // `userRole` comes from the session-hint cookie and is NOT authenticated. It is
  // used only as a UI ROUTING HINT (send admins to /admin, guests to /login) and
  // is NEVER the source of authorization. Every real authorization decision is
  // enforced server-side on each API call (JwtAuthGuard + AdminGuard verify the
  // JWT signature with the server's secret). Someone who forges this cookie sees
  // an empty admin shell and nothing more — the same exposure as the previous
  // unverified JWT decode this replaced.
  // DO NOT use this value for any authorization or trust decision.
  
  // Kiểm tra xem route có cần authentication không
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Kiểm tra xem route có phải guest-only không
  const isGuestOnlyRoute = guestOnlyRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Nếu là protected route và không có valid token
  if (isProtectedRoute && !sessionHint) {
    console.log(`🔴 Middleware: Protecting route ${pathname} - no refresh token`);
    
    // Nếu là /admin hoặc /admin/* thì redirect sang /unauthorized
    if (pathname.startsWith('/admin')) {
      const unauthorizedResponse = NextResponse.redirect(new URL('/unauthorized', request.url));
      unauthorizedResponse.cookies.delete('sessionHint')
      if (currentLanguage) {
        unauthorizedResponse.cookies.set('language', currentLanguage, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax'
        })
      }
      return unauthorizedResponse;
    }
    // Các route khác redirect về /login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    const loginResponse = NextResponse.redirect(loginUrl)
    loginResponse.cookies.delete('sessionHint')
    if (currentLanguage) {
      loginResponse.cookies.set('language', currentLanguage, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      })
    }
    return loginResponse
  }

  // Nếu đã đăng nhập nhưng vào /admin mà không phải admin
  if (sessionHint && pathname.startsWith('/admin') && userRole !== 'admin') {
    console.log(`🔴 Middleware: User ${userRole} trying to access admin route`);
    const unauthorizedResponse = NextResponse.redirect(new URL('/unauthorized', request.url));
    if (currentLanguage) {
      unauthorizedResponse.cookies.set('language', currentLanguage, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      })
    }
    return unauthorizedResponse;
  }
  
  // Nếu là guest-only route và đã có valid token, redirect về home
  if (isGuestOnlyRoute && sessionHint) {
    console.log(`ℹ️ Middleware: User already logged in, redirecting from ${pathname}`);
    const homeUrl = new URL('/', request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    if (currentLanguage) {
      redirectResponse.cookies.set('language', currentLanguage, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      })
    }
    return redirectResponse;
  }
  
  // Nếu token hết hạn nhưng có refresh token, middleware không xử lý
  // (API interceptor sẽ handle refresh bằng fetch-wrapper)
  // Chỉ redirect và clear cookies nếu là protected route không có token
  
  return response
}

// Cấu hình matcher để middleware chỉ chạy cho các routes cần thiết
export const config = {
  matcher: [
    // Bao gồm tất cả routes trừ các file static
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}