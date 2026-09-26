export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { ForgotPasswordRequestSchema } from '@/lib/validators';
import { sendVerificationOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // 1. Check if user exists in the system
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email address. Please verify your email or sign up.',
        },
        { status: 404 }
      );
    }

    // 2. Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store OTP record in MongoDB (expires in 10 minutes)
    await EmailOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: user.name || 'Member',
        passwordHash: 'FORGOT_PASSWORD_RESET',
        otp,
        attempts: 0,
        lastSentAt: new Date(),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 4. Send verification OTP email
    const mailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: user.name || 'Member',
      otp,
    });

    if (!mailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: mailResult.error || 'Failed to dispatch verification email. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requireOtp: true,
        email: normalizedEmail,
        message: 'A 6-digit password reset code has been sent to your email address.',
        devMode: mailResult.devMode,
        previewOtp: mailResult.devMode ? mailResult.previewOtp : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot Password Request error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
