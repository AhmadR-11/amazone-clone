export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies, signToken } from '@/lib/auth';
import { UpdateProfileSchema } from '@/lib/validators';

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
    console.error('Get profile error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
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

    const postalCode = String(body.postalCode || body.zipCode || '00000').trim();
    const isDefault = Boolean(body.isDefault || user.addresses.length === 0);

    if (isDefault && user.addresses.length > 0) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label: body.label || 'Home',
      fullName: body.fullName || user.name || 'Recipient',
      street: body.street || body.line1 || 'Street Address',
      city: body.city || 'City',
      state: body.state || 'State',
      postalCode: postalCode,
      country: body.country || 'United States',
      phone: body.phone || '0000000000',
      isDefault: isDefault,
    } as any);

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    console.error('Save address error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update profile (Name, Avatar, etc.)
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user });

    // Refresh token cookie with new name if name changed
    if (parsed.data.name) {
      const newToken = signToken({
        userId: session.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      response.cookies.set('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/profile?addressId=... - Delete saved address
export async function DELETE(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    if (!addressId) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.addresses = user.addresses.filter((a: any) => a._id?.toString() !== addressId);
    await user.save();

    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
