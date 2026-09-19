export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies() as any;
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const q = searchParams.get('q') || '';
    const limit = 20;

    const query: any = {};
    if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
