import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

// PUT /api/user/address/[id] — Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const addr = (user.addresses as any[]).find(
      (a: any) => a._id.toString() === params.id
    );
    if (!addr) return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });

    if (updates.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }

    Object.assign(addr, updates);
    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/user/address/[id] — Remove address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== params.id) as any;
    // If deleted was default, set first remaining as default
    if (user.addresses.length > 0 && !user.addresses.some((a: any) => a.isDefault)) {
      (user.addresses[0] as any).isDefault = true;
    }
    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
