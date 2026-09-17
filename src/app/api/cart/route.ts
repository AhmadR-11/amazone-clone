import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserSessionFromCookies } from '@/lib/auth';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ authenticated: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId: session.userId }).populate('items.productId');
    return NextResponse.json({ authenticated: true, cart: cart || { items: [] } });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ authenticated: false, message: 'Authentication required to add items to cart' }, { status: 401 });
    }

    const { productId, quantity = 1, color, size } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'ProductId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId: session.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: session.userId,
        items: [{ productId, quantity, color, size }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId && item.color === color && item.size === size
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, color, size });
      }

      await cart.save();
    }

    const updatedCart = await Cart.findOne({ userId: session.userId }).populate('items.productId');
    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
