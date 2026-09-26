export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

// PUT /api/admin/users/[id]/role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserSessionFromCookies() as any;
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (session.userId === params.id) {
      return NextResponse.json({ success: false, message: 'Cannot change your own role' }, { status: 400 });
    }

    const { role } = await request.json();
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(params.id, { role }, { new: true }).select('name email role');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
