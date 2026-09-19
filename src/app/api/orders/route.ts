export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ userId: session.userId })
      .sort({ placedAt: -1 })
      .limit(50);

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
