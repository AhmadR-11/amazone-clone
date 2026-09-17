import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getUserSessionFromCookies } from '@/lib/auth';
import { CartItemSchema } from '@/lib/validators';

// POST /api/cart/add
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid item data' },
        { status: 400 }
      );
    }

    const { asin, title, image, price, quantity, color, size } = parsed.data;

    await connectToDatabase();

    const cart = await Cart.findOneAndUpdate(
      { userId: session.userId },
      { $setOnInsert: { userId: session.userId, items: [] } },
      { upsert: true, new: true }
    );

    // Check if item already exists with same asin/color/size
    const existingIdx = cart.items.findIndex(
      (i: any) =>
        i.asin === asin &&
        (color ? i.color === color : !i.color) &&
        (size ? i.size === size : !i.size)
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity = Math.min(
        99,
        cart.items[existingIdx].quantity + quantity
      );
    } else {
      cart.items.push({ asin, title, image, price, quantity, color, size });
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error('Cart add error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
