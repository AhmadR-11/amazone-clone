import nodemailer from 'nodemailer';

interface SendOtpOptions {
  to: string;
  name: string;
  otp: string;
}

interface SendEmailResult {
  success: boolean;
  devMode?: boolean;
  previewOtp?: string;
  error?: string;
}

/**
 * Creates and returns a Nodemailer transporter if SMTP environment variables are set.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Generates the Amazon-branded HTML email template for email verification OTP.
 */
function getAmazonOtpEmailHtml(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amazon Clone Verification Code</title>
</head>
<body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; color: #333333;">
  <div style="max-width: 580px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background-color: #131921; padding: 18px 24px; text-align: left;">
      <span style="color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: -0.5px;">amazon<span style="color: #ff9900;">.clone</span></span>
    </div>

    <!-- Content Body -->
    <div style="padding: 28px 32px 32px 32px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #111111; margin-top: 0; margin-bottom: 16px;">Verify your new Amazon account</h2>
      <p style="font-size: 14px; line-height: 1.5; color: #333333; margin-bottom: 20px;">
        Hello <strong>${name}</strong>,<br>
        To verify your email address and finish setting up your account, please enter the following One-Time Password (OTP):
      </p>

      <!-- OTP Box -->
      <div style="background-color: #fcfcfc; border: 1px solid #ddd; border-left: 4px solid #ff9900; padding: 18px 24px; margin: 24px 0; border-radius: 4px; text-align: center;">
        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #767676; letter-spacing: 1px; margin-bottom: 6px;">Your verification code</span>
        <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #111111; font-family: monospace;">${otp}</span>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #555555; margin-bottom: 12px;">
        ⏳ <strong>This code expires in 10 minutes.</strong>
      </p>

      <p style="font-size: 12px; line-height: 1.5; color: #767676; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px;">
        Security Notice: Amazon will never ask you for your password or OTP in an email or message. If you did not request this verification, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 16px 32px; font-size: 11px; color: #999999; text-align: center;">
      © ${new Date().getFullYear()} Amazon Clone. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends a 6-digit OTP email to the user's email address.
 * Uses SMTP if configured, or falls back to server console logging in development.
 */
export async function sendVerificationOtpEmail({
  to,
  name,
  otp,
}: SendOtpOptions): Promise<SendEmailResult> {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || 'Amazon Clone <no-reply@amazon-clone.local>';

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${otp} is your Amazon verification code`,
        text: `Your Amazon verification code is: ${otp}. It expires in 10 minutes.`,
        html: getAmazonOtpEmailHtml(name, otp),
      });

      return { success: true, devMode: false };
    } catch (err: any) {
      console.error('Failed to send verification email via SMTP:', err);
      return { success: false, error: err.message || 'Failed to send verification email' };
    }
  }

  // Development mode fallback when SMTP is not configured in .env.local
  console.log('\n============================================================');
  console.log('📧 [AMAZON CLONE EMAIL SERVICE - LOCAL DEV MODE]');
  console.log(`To: ${to}`);
  console.log(`Recipient: ${name}`);
  console.log(`🔑 Verification OTP Code: ${otp}`);
  console.log('Valid for: 10 minutes');
  console.log('Tip: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local for live inbox delivery.');
  console.log('============================================================\n');

  return { success: true, devMode: true, previewOtp: otp };
}
