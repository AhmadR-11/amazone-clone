import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import { getUserSessionFromCookies } from '@/lib/auth';

// POST /api/wishlist/add
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Please sign in to use wishlists' }, { status: 401 });
    }

    const { asin, title, imageUrl, price, category } = await request.json();
    if (!asin || !title) {
      return NextResponse.json({ success: false, message: 'asin and title are required' }, { status: 400 });
    }

    await connectToDatabase();

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: session.userId },
      {
        $addToSet: {
          items: { asin, title, imageUrl: imageUrl || '', price: price || 0, category: category || '', addedAt: new Date() },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, items: wishlist.items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
