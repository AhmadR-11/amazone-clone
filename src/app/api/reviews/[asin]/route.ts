import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/lib/models/Review';
import Order from '@/lib/models/Order';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/reviews/[asin]
export async function GET(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const query: any = { asin: params.asin };
    if (rating) query.rating = parseInt(rating);
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(50).lean();
    const totalCount = await Review.countDocuments({ asin: params.asin });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return NextResponse.json({ success: true, reviews, totalCount, avgRating });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/reviews/[asin]
export async function POST(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Please sign in to write reviews' }, { status: 401 });
    }

    const { rating, title, body } = await request.json();
    if (!rating || !title || !body) {
      return NextResponse.json({ success: false, message: 'rating, title, and body are required' }, { status: 400 });
    }
    if (body.length < 20) {
      return NextResponse.json({ success: false, message: 'Review body must be at least 20 characters' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if already reviewed
    const existing = await Review.findOne({ asin: params.asin, userId: session.userId });
    if (existing) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this product' }, { status: 409 });
    }

    // Check for verified purchase
    const order = await Order.findOne({
      userId: session.userId,
      'items.asin': params.asin,
      status: 'delivered',
    });

    const review = await Review.create({
      asin: params.asin,
      userId: session.userId,
      userName: session.name,
      rating,
      title,
      body,
      verifiedPurchase: !!order,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this product' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
