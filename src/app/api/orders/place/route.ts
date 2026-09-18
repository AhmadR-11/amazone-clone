import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import Notification from '@/lib/models/Notification';
import { getUserSessionFromCookies } from '@/lib/auth';

const COUPON_CODES: Record<string, { type: 'percent' | 'shipping'; value: number }> = {
  SAVE10: { type: 'percent', value: 10 },
  SAVE20: { type: 'percent', value: 20 },
  FREESHIP: { type: 'shipping', value: 0 },
};

// POST /api/orders/place
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Please sign in to place an order' }, { status: 401 });
    }
    const userId = session.userId;

    const body = await request.json();
    const { shippingAddress, paymentMethod, couponCode, items: inputItems } = body;

    if (!shippingAddress?.fullName || !shippingAddress?.street) {
      return NextResponse.json({ success: false, message: 'Shipping address is required' }, { status: 400 });
    }
    if (!paymentMethod?.type) {
      return NextResponse.json({ success: false, message: 'Payment method is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Get items from DB cart or request body
    const cart = await Cart.findOne({ userId });
    let orderItems = inputItems || [];
    if (cart && cart.items && cart.items.length > 0) {
      orderItems = cart.items.map((i: any) => ({
        asin: i.asin,
        title: i.title,
        imageUrl: i.image || i.imageUrl || '',
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));
    } else if (orderItems.length > 0) {
      orderItems = orderItems.map((i: any) => ({
        ...i,
        imageUrl: i.image || i.imageUrl || '',
        subtotal: i.price * i.quantity,
      }));
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    const subtotal = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    let shipping = subtotal >= 50 ? 0 : 4.99;
    const taxRate = 0.08;
    let discount = 0;

    // Apply coupon
    let appliedCoupon = '';
    if (couponCode && COUPON_CODES[couponCode.toUpperCase()]) {
      const coupon = COUPON_CODES[couponCode.toUpperCase()];
      appliedCoupon = couponCode.toUpperCase();
      if (coupon.type === 'percent') {
        discount = subtotal * (coupon.value / 100);
      } else if (coupon.type === 'shipping') {
        shipping = 0;
      }
    }

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + shipping + tax;

    // Idempotency check — prevent double submission within 30s
    const recentOrder = await Order.findOne({
      userId,
      'pricing.total': { $gte: total - 1, $lte: total + 1 },
      placedAt: { $gte: new Date(Date.now() - 30000) },
    });
    if (recentOrder) {
      return NextResponse.json({ success: true, orderId: recentOrder._id, order: recentOrder, duplicate: true });
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      pricing: { subtotal, shipping, tax, discount, total },
      couponCode: appliedCoupon || undefined,
      status: 'placed',
      statusHistory: [{ status: 'placed', updatedAt: new Date(), note: 'Order placed by customer' }],
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      placedAt: new Date(),
    });

    // Clear cart
    if (cart) {
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    }

    // Create notification
    await Notification.create({
      userId,
      type: 'order_placed',
      title: 'Order Placed Successfully! 🎉',
      message: `Your order ${order.orderNumber} has been placed. Estimated delivery: ${order.estimatedDelivery.toDateString()}.`,
      link: `/orders/${order._id}`,
    });

    // Simulate status progression (async, non-blocking)
    simulateOrderProgression(order._id.toString(), userId);

    return NextResponse.json({ success: true, orderId: order._id, order }, { status: 201 });
  } catch (error: any) {
    console.error('Place order error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// Simulate order status progression for demo purposes
async function simulateOrderProgression(orderId: string, userId: string) {
  const steps = [
    { status: 'processing', delay: 2 * 60 * 1000, note: 'Order confirmed and being prepared' },
    { status: 'shipped', delay: 5 * 60 * 1000, note: 'Package picked up by courier' },
    { status: 'out_for_delivery', delay: 10 * 60 * 1000, note: 'Out for delivery in your area' },
    { status: 'delivered', delay: 15 * 60 * 1000, note: 'Package delivered successfully' },
  ];

  for (const step of steps) {
    setTimeout(async () => {
      try {
        await connectToDatabase();
        const order = await Order.findById(orderId);
        if (!order || order.status === 'cancelled') return;

        order.status = step.status as any;
        order.statusHistory.push({ status: step.status, updatedAt: new Date(), note: step.note });
        await order.save();

        const notifTypes: Record<string, string> = {
          shipped: 'order_shipped',
          delivered: 'order_delivered',
        };
        if (notifTypes[step.status]) {
          await Notification.create({
            userId,
            type: notifTypes[step.status],
            title: step.status === 'shipped' ? '📦 Order Shipped!' : '✅ Order Delivered!',
            message: `Your order ${order.orderNumber} has been ${step.status}. ${step.note}`,
            link: `/orders/${orderId}`,
          });
        }
      } catch (e) {
        // Silently fail — demo progression
      }
    }, step.delay);
  }
}
