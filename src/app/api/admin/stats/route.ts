import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import { getUserSessionFromCookies } from '@/lib/auth';

function requireAdmin(session: any) {
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  return null;
}

// GET /api/admin/stats
export async function GET() {
  try {
    const session = getUserSessionFromCookies() as any;
    const err = requireAdmin(session);
    if (err) return err;

    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({ placedAt: { $gte: today } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['placed', 'processing'] } });

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentOrders = await Order.find()
      .sort({ placedAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      stats: { totalUsers, totalOrders, totalRevenue, ordersToday, pendingOrders },
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
