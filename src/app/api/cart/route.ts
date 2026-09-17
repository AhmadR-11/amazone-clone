import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getUserSessionFromCookies } from '@/lib/auth';

function getUserId(request: NextRequest): string | null {
  const session = getUserSessionFromCookies();
  if (session) return session.userId;
  return null;
}

// GET /api/cart  - Fetch cart
export async function GET(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ cart: { items: [] } });
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: session.userId });
    return NextResponse.json({ cart: cart || { userId: session.userId, items: [] } });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart  - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ cart: { items: [] } });
    }

    const { searchParams } = new URL(request.url);
    const asin = searchParams.get('asin');

    await connectToDatabase();

    if (asin) {
      // Remove single item
      const color = searchParams.get('color') || undefined;
      const size = searchParams.get('size') || undefined;

      const cart = await Cart.findOneAndUpdate(
        { userId: session.userId },
        {
          $pull: {
            items: {
              asin,
              ...(color ? { color } : {}),
              ...(size ? { size } : {}),
            },
          },
        },
        { new: true }
      );
      return NextResponse.json({ cart: cart || { items: [] } });
    }

    // Clear all
    const cart = await Cart.findOneAndUpdate(
      { userId: session.userId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
