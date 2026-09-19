export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Notification from '@/lib/models/Notification';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/admin/orders
export async function GET(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies() as any;
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 20;

    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
