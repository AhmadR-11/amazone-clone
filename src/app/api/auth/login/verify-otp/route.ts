import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { signToken, signRefreshToken } from '@/lib/auth';
import { VerifyOtpSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // Verify that the user account exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 404 }
      );
    }

    // Retrieve pending OTP record
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'The verification code has expired or was not requested. Please sign in again.',
        },
        { status: 400 }
      );
    }

    // Rate limiting: protect against brute force OTP guessing (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        {
          success: false,
          message: 'Too many incorrect attempts. For security, this code has expired. Please sign in again.',
        },
        { status: 429 }
      );
    }

    // Verify OTP code
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return NextResponse.json(
        {
          success: false,
          message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code will expire on next attempt.'}`,
        },
        { status: 400 }
      );
    }

    // OTP is valid! Mark email as verified if not already
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }

    // Delete OTP record after successful login
    await EmailOtp.deleteOne({ _id: otpRecord._id });

    // Generate JWT access & refresh tokens
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

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: (user as any).role || 'user' },
        message: 'Email verified successfully! Logging you in...',
      },
      { status: 200 }
    );

    // Access token cookie (15m)
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    });

    // Refresh token cookie (30d)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    // Clear guest session token if present
    response.cookies.delete('guest_session_token');

    return response;
  } catch (error: any) {
    console.error('Verify Login OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
