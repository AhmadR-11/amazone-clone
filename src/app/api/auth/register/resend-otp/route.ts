export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { ResendOtpSchema } from '@/lib/validators';
import { sendVerificationOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ResendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Find existing pending OTP record
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'No pending registration found for this email. Please register again.',
        },
        { status: 404 }
      );
    }

    // Enforce 30-second cooldown between resend requests
    const now = Date.now();
    const lastSent = new Date(otpRecord.lastSentAt).getTime();
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    const cooldownSeconds = 30;

    if (elapsedSeconds < cooldownSeconds) {
      const waitSeconds = cooldownSeconds - elapsedSeconds;
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds} second${waitSeconds > 1 ? 's' : ''} before requesting another code.`,
        },
        { status: 429 }
      );
    }

    // Generate fresh 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    otpRecord.otp = newOtp;
    otpRecord.attempts = 0;
    otpRecord.lastSentAt = new Date();
    otpRecord.createdAt = new Date(); // resets TTL expiry to fresh 10 mins
    await otpRecord.save();

    // Send email
    const mailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: otpRecord.name,
      otp: newOtp,
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
      message: 'A new verification code has been sent to your email.',
      devMode: mailResult.devMode,
      previewOtp: mailResult.devMode ? mailResult.previewOtp : undefined,
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
