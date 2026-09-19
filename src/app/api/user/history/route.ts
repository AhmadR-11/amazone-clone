export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/user/history
export async function GET(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ viewHistory: [], searchHistory: [] });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId, 'viewHistory searchHistory');
    if (!user) {
      return NextResponse.json({ viewHistory: [], searchHistory: [] });
    }

    return NextResponse.json({
      viewHistory: user.viewHistory.slice(-20).reverse(),
      searchHistory: user.searchHistory.slice(-10).reverse(),
    });
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/history
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false });
    }

    const body = await request.json();
    const { type } = body;

    await connectToDatabase();

    if (type === 'view') {
      const { asin, title, image, price, category } = body;
      await User.findByIdAndUpdate(session.userId, {
        $push: {
          viewHistory: {
            $each: [{ asin, title, image, price, category, timestamp: new Date() }],
            $slice: -50, // Keep latest 50
          },
        },
      });
    } else if (type === 'search') {
      const { query, category } = body;
      if (query?.trim()) {
        await User.findByIdAndUpdate(session.userId, {
          $push: {
            searchHistory: {
              $each: [{ query: query.trim(), category, timestamp: new Date() }],
              $slice: -20, // Keep latest 20
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('History POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
