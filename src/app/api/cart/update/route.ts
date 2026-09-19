export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getUserSessionFromCookies } from '@/lib/auth';

// PUT /api/cart/update  - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { asin, quantity, color, size } = await request.json();

    if (!asin || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();

    if (quantity <= 0) {
      // Remove item
      const cart = await Cart.findOneAndUpdate(
        { userId: session.userId },
        { $pull: { items: { asin } } },
        { new: true }
      );
      return NextResponse.json({ success: true, cart });
    }

    const cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const idx = cart.items.findIndex(
      (i: any) =>
        i.asin === asin &&
        (color ? i.color === color : true) &&
        (size ? i.size === size : true)
    );

    if (idx >= 0) {
      cart.items[idx].quantity = Math.min(99, quantity);
      await cart.save();
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
