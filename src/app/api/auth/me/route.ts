export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import {
  getUserSessionFromCookies,
  getSessionTimeRemaining,
  createGuestSessionToken,
} from '@/lib/auth';

export async function GET() {
  try {
    const session = getUserSessionFromCookies();

    if (!session) {
      // Create a guest session token
      const { token, session: guestSession } = createGuestSessionToken();

      const response = NextResponse.json({
        isGuest: true,
        sessionKey: guestSession.sessionKey || token,
        sessionTimeRemaining: getSessionTimeRemaining(guestSession),
        user: null,
      });

      response.cookies.set('guest_session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      });

      return response;
    }

    if (session.isGuest) {
      return NextResponse.json({
        isGuest: true,
        sessionKey: session.sessionKey || 'guest',
        sessionTimeRemaining: getSessionTimeRemaining(session),
        user: null,
      });
    }

    let avatar = undefined;
    let name = session.name;
    try {
      await connectToDatabase();
      const dbUser = await User.findById(session.userId, 'name avatar role').lean();
      if (dbUser) {
        avatar = (dbUser as any).avatar;
        if ((dbUser as any).name) name = (dbUser as any).name;
      }
    } catch (e) {
      // ignore db error, fall back to session
    }

    return NextResponse.json({
      isGuest: false,
      sessionTimeRemaining: getSessionTimeRemaining(session),
      user: {
        id: session.userId,
        userId: session.userId,
        name: name,
        email: session.email,
        role: session.role || 'user',
        avatar: avatar,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
