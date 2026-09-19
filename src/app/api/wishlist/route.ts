export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/wishlist
export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const wishlist = await Wishlist.findOne({ userId: session.userId });
    return NextResponse.json({ success: true, items: wishlist?.items || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
