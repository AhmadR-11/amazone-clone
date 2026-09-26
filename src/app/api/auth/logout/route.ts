export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

export async function POST() {
  try {
    const session = getUserSessionFromCookies();

    if (session && !session.isGuest) {
      await connectToDatabase();
      await User.findByIdAndUpdate(session.userId, { $unset: { refreshToken: 1 } });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('guest_session_token');

    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('guest_session_token');
    return response;
  }
}
