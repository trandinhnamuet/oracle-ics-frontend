import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware no longer performs any authentication check.
 *
 * It used to read a "session hint" cookie scoped to Path=/ to decide whether to
 * render a protected page or bounce to /login. A site-wide cookie is exactly the
 * pattern the security review asked us to remove, so the gate moved to the
 * client: app/profile/layout.tsx and app/admin/layout.tsx wrap their pages in
 * <AuthGuard>, which asks the server whether the HttpOnly refresh cookie still
 * yields a session and redirects if it does not.
 *
 * Nothing security-relevant was lost — the middleware check was only a routing
 * hint, and every API call is authorised server-side.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Default the language cookie so server and client render the same markup.
  if (!request.cookies.get('language')?.value) {
    response.cookies.set('language', 'vi', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.png$|.*\.jpg$|.*\.jpeg$|.*\.gif$|.*\.svg$).*)',
  ],
}
