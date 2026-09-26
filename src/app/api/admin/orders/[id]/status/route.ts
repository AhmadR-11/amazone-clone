export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Notification from '@/lib/models/Notification';
import { getUserSessionFromCookies } from '@/lib/auth';

// PUT /api/admin/orders/[id]/status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserSessionFromCookies() as any;
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { status, note } = await request.json();
    if (!status) return NextResponse.json({ success: false, message: 'status is required' }, { status: 400 });

    await connectToDatabase();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    order.status = status;
    order.statusHistory.push({ status, updatedAt: new Date(), note: note || '' });
    await order.save();

    // Create notification for user
    const notifMap: Record<string, { title: string; message: string }> = {
      shipped: { title: 'Order Shipped!', message: `Your order ${order.orderNumber} has been shipped.` },
      delivered: { title: 'Order Delivered!', message: `Your order ${order.orderNumber} has been delivered.` },
      cancelled: { title: 'Order Cancelled', message: `Your order ${order.orderNumber} has been cancelled.` },
    };
    if (notifMap[status]) {
      await Notification.create({
        userId: order.userId,
        type: `order_${status}` as any,
        title: notifMap[status].title,
        message: notifMap[status].message,
        link: `/orders/${order._id}`,
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
