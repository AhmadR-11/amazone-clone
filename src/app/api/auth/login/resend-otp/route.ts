import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { sendVerificationOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found.' },
        { status: 404 }
      );
    }

    const existingOtp = await EmailOtp.findOne({ email: normalizedEmail });

    // Rate limit resend requests (minimum 30 seconds between requests)
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (elapsedMs < 30000) {
        const waitSeconds = Math.ceil((30000 - elapsedMs) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
          },
          { status: 429 }
        );
      }
    }

    // Generate fresh 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await EmailOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: user.name,
        passwordHash: user.passwordHash,
        otp,
        attempts: 0,
        lastSentAt: new Date(),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const mailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: user.name,
      otp,
    });

    if (!mailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: mailResult.error || 'Failed to resend verification email.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A new verification code has been sent to your email address.',
      devMode: mailResult.devMode,
      previewOtp: mailResult.devMode ? mailResult.previewOtp : undefined,
    });
  } catch (error: any) {
    console.error('Resend login OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
