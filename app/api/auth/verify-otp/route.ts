import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Robustly read one cookie value from a backend response. Uses getSetCookie()
// so multi-cookie responses aren't corrupted by naive comma-joining, and drops
// the backend's Domain attribute so the cookie is re-issued host-only here.
function extractCookieValue(response: Response, cookieName: string): string | null {
  const headers = response.headers as unknown as { getSetCookie?: () => string[] };
  const setCookies: string[] =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : (response.headers.get('set-cookie')?.split(/, (?=[^;])/) ?? []);
  for (const cookieStr of setCookies) {
    const [nameValue] = cookieStr.split(';');
    const eqIdx = nameValue.indexOf('=');
    if (eqIdx < 0) continue;
    const name = nameValue.slice(0, eqIdx).trim();
    const value = nameValue.slice(eqIdx + 1).trim();
    if (name === cookieName) return value || null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { message: 'OTP code must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      // Create response with user data
      const nextResponse = NextResponse.json({
        user: data.user,
        message: data.message || 'Email verified successfully',
      });

      // Re-issue the refresh cookie host-only (path=/, no Domain) if the backend
      // set one, matching the login/refresh proxies. This avoids a second
      // Domain-scoped cookie of the same name that logout could not clear.
      const tokenValue = extractCookieValue(response, COOKIE_NAME);
      if (tokenValue) {
        nextResponse.cookies.set({
          name: COOKIE_NAME,
          value: tokenValue,
          httpOnly: true,
          secure: IS_PROD,
          sameSite: 'lax',
          path: '/',
          maxAge: COOKIE_MAX_AGE,
        });
      }

      return nextResponse;
    } else {
      return NextResponse.json(
        { message: data.message || 'Verification failed' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}