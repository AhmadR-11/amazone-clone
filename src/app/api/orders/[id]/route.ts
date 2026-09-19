export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const order = await Order.findOne({
      _id: params.id,
      userId: session.userId, // Security: ensure order belongs to this user
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
