import { NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = getUserSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
