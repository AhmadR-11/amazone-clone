export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import EmailOtp from '@/lib/models/EmailOtp';
import { RegisterSchema } from '@/lib/validators';
import { validateEmailExistence } from '@/lib/emailExistence';
import { sendVerificationOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify that email domain actually exists and can receive emails (DNS MX record check)
    const emailValidation = await validateEmailExistence(normalizedEmail);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, message: emailValidation.error || 'Invalid or non-existent email address' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Store pending registration data with OTP in MongoDB (auto-expires in 10 minutes)
    await EmailOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        otp,
        attempts: 0,
        lastSentAt: new Date(),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 6. Send OTP verification email to user's real email inbox
    const mailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otp,
    });

    if (!mailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: mailResult.error || 'Failed to send verification email. Please check your email address.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requireOtp: true,
        email: normalizedEmail,
        message: 'Verification code sent to your email address.',
        devMode: mailResult.devMode,
        previewOtp: mailResult.devMode ? mailResult.previewOtp : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
