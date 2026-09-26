export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserSessionFromCookies } from '@/lib/auth';

// POST /api/user/address — Add new address
export async function POST(request: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = body;
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ success: false, message: 'All address fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (user.addresses.length >= 5) {
      return NextResponse.json({ success: false, message: 'Maximum 5 addresses allowed' }, { status: 400 });
    }

    if (isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }

    user.addresses.push({
      label: label || 'Home',
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'US',
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// GET /api/user/address — List all addresses
export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session || session.isGuest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const user = await User.findById(session.userId).select('addresses');
    return NextResponse.json({ success: true, addresses: user?.addresses || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
