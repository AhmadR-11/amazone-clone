export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { ForgotPasswordResetSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // 1. Verify user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Account not found. Please verify your email address.' },
        { status: 404 }
      );
    }

    // 2. Retrieve OTP record from DB
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification code has expired or is invalid. Please request a new code.',
        },
        { status: 400 }
      );
    }

    // 3. Verify OTP code match
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (otpRecord.attempts >= 5) {
        await EmailOtp.deleteOne({ email: normalizedEmail });
        return NextResponse.json(
          {
            success: false,
            message: 'Too many incorrect attempts. Please request a new verification code.',
          },
          { status: 400 }
        );
      }
      await otpRecord.save();
      return NextResponse.json(
        { success: false, message: 'Invalid verification code. Please check your 6-digit code.' },
        { status: 400 }
      );
    }

    // 4. Hash new password and update User document
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    // 5. Delete used OTP record
    await EmailOtp.deleteOne({ email: normalizedEmail });

    return NextResponse.json(
      {
        success: true,
        message: 'Your password has been reset successfully. You can now sign in with your new password.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot Password Reset error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
