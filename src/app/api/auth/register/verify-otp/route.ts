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

    // Check if an account was already registered while waiting
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await EmailOtp.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { success: false, message: 'An account with this email has already been verified and registered.' },
        { status: 409 }
      );
    }

    // Retrieve pending OTP record
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'The verification code has expired or was not requested. Please start registration again.',
        },
        { status: 400 }
      );
    }

    // Rate limiting: protect against brute force OTP guessing
    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        {
          success: false,
          message: 'Too many incorrect attempts. For security, this code has expired. Please request a new code.',
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

    // OTP is valid! Create the verified user
    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      passwordHash: otpRecord.passwordHash,
      isEmailVerified: true,
      addresses: [],
      searchHistory: [],
      viewHistory: [],
    });

    // Delete OTP record after successful registration
    await EmailOtp.deleteOne({ _id: otpRecord._id });

    // Generate JWT access & refresh tokens
    const accessToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    user.refreshToken = refreshToken;
    await user.save();

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user._id, name: user.name, email: user.email },
        message: 'Email successfully verified and account created!',
      },
      { status: 201 }
    );

    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.delete('guest_session_token');

    return response;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
