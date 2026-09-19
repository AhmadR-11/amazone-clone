import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { signToken, signRefreshToken } from '@/lib/auth';
import { LoginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign JWT access and refresh tokens
    const accessToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: (user as any).role || 'user',
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: (user as any).role || 'user',
    });

    user.refreshToken = refreshToken;
    await user.save();

    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: (user as any).role || 'user' },
      message: 'Logged in successfully',
    });

    // Access token (15m)
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    });

    // Refresh token (30d)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    // Clear guest cookies
    response.cookies.delete('guest_session_token');

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


