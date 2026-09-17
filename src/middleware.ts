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
  let response = NextResponse.next();

  // If access token expired but refresh token exists, try silent refresh
  if (!session && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      session = refreshPayload;
      const newAccessToken = signToken({
        userId: refreshPayload.userId,
        email: refreshPayload.email,
        name: refreshPayload.name,
      });

      response = isAuthPage
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();

      response.cookies.set('token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
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

  return response;
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/auth/:path*',
  ],
};
