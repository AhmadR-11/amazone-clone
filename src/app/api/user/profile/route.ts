export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';
import { UpdateProfileSchema, AddressSchema } from '@/lib/validators';

// GET /api/user/profile
export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId, '-passwordHash -refreshToken');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/profile - Add new address
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.addresses.push({
      fullName: body.fullName,
      street: body.street || body.line1,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode || body.postalCode,
      country: body.country || 'United States',
      phone: body.phone,
      isDefault: body.isDefault || user.addresses.length === 0,
    } as any);

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      session.userId,
      { $set: parsed.data },
      { new: true, select: '-passwordHash -refreshToken' }
    );

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
