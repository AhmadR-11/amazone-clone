import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyRefreshToken, signToken } from '@/lib/auth';

// Auth pages — redirect already-logged-in users back home
const AUTH_PATHS = ['/auth/login', '/auth/register'];

// All page-level auth checks (profile, orders, checkout, wishlist, etc.)
// are handled INSIDE each page by calling /api/auth/me.
// The middleware's only jobs are:
//   1. Silent access-token refresh using the refresh cookie
//   2. Redirect logged-in users away from /auth/* pages
// This avoids false redirects when the 15-min access token expires but
// the user is still legitimately authenticated via the refresh cookie.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  const accessToken  = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const guestToken   = request.cookies.get('guest_session_token')?.value;

  // 1. Verify access token
  let session = accessToken ? verifyToken(accessToken) : null;

  let response       = NextResponse.next();
  let refreshedToken: string | null = null;

  // 2. Silent refresh: if access token is expired/missing but refresh token is valid
  if (!session && refreshToken) {
    try {
      const refreshPayload = verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        session = refreshPayload;
        refreshedToken = signToken({
          userId: refreshPayload.userId,
          email:  refreshPayload.email,
          name:   refreshPayload.name,
          role:   refreshPayload.role,
        });
      }
    } catch {
      // refresh token invalid — session stays null
    }
  }

  // 3. Guest token fallback (for non-auth pages)
  if (!session && guestToken) {
    try {
      const guestSession = verifyToken(guestToken);
      if (guestSession?.isGuest) session = guestSession;
    } catch {
      // ignore
    }
  }

  const isRealUser = session && !session.isGuest;

  // 4. Redirect logged-in users away from login/register
  if (isAuthPage && isRealUser) {
    const returnTo = request.nextUrl.searchParams.get('returnUrl')
                  || request.nextUrl.searchParams.get('redirect')
                  || '/';
    // Safety: only allow relative paths to prevent open-redirect
    const safeReturn = returnTo.startsWith('/') ? returnTo : '/';
    response = NextResponse.redirect(new URL(safeReturn, request.url));
  }

  // 5. Attach refreshed access-token cookie if we minted one
  if (refreshedToken) {
    response.cookies.set('token', refreshedToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 15, // 15 minutes
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all page routes that need silent token refresh or auth-redirect logic
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/wishlist/:path*',
    '/notifications/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
};
