import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import { getUserSessionFromCookies } from '@/lib/auth';

// DELETE /api/wishlist/remove/[asin]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: session.userId },
      { $pull: { items: { asin: params.asin } } },
      { new: true }
    );
    return NextResponse.json({ success: true, items: wishlist?.items || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
