import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyRefreshToken, signToken } from '@/lib/auth';

const PROTECTED_PATHS = ['/profile', '/orders', '/checkout'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  const accessToken = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Try verifying access token
  let session = accessToken ? verifyToken(accessToken) : null;

  // If access token expired but refresh token exists, try silent refresh
  if (!session && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      // Issue a new access token inline
      const newAccessToken = signToken({
        userId: refreshPayload.userId,
        email: refreshPayload.email,
        name: refreshPayload.name,
      });

      // If heading to a protected page — allow and set new cookie
      const response = isProtected
        ? NextResponse.next()
        : NextResponse.next();

      response.cookies.set('token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });

      // If trying to access auth pages while already authenticated → redirect home
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return response;
    }
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage && session && !session.isGuest) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/auth/:path*',
  ],
};
