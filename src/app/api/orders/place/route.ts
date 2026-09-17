import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import { getUserSessionFromCookies } from '@/lib/auth';
import { PlaceOrderSchema } from '@/lib/validators';

// POST /api/orders/place
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    const userId = session?.userId || 'guest_session';

    const body = await request.json();
    const parsed = PlaceOrderSchema.safeParse(body);

    const shippingAddress = parsed.success ? parsed.data.shippingAddress : body.shippingAddress;
    const paymentMethod = parsed.success ? (typeof parsed.data.paymentMethod === 'string' ? parsed.data.paymentMethod : 'card') : (body.paymentMethod || 'card');
    const inputItems = body.items || [];
    const totalAmount = body.totalAmount || 0;

    await connectToDatabase();

    // Try finding user cart from DB first
    let cart = await Cart.findOne({ userId });
    let orderItems = inputItems;

    if (cart && cart.items && cart.items.length > 0) {
      orderItems = cart.items.map((i: any) => ({
        asin: i.asin,
        title: i.title,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        color: i.color,
        size: i.size,
      }));
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = subtotal >= 50 ? 0 : 4.99;
    const total = totalAmount || (subtotal + shippingCost);

    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      totalAmount: total,
      status: 'Processing',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    // Clear cart in DB if found
    if (cart) {
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
    }

    return NextResponse.json({ success: true, orderId: order._id, order });
  } catch (error: any) {
    console.error('Place order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
