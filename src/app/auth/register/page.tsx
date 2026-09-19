'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/';
  const { fetchSession } = useAuthStore();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Step 1: Initial Registration Form Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Failed to initiate account creation.');
      } else if (data.requireOtp) {
        setStep('otp');
        setCooldown(30);
        if (data.previewOtp) {
          setDevOtp(data.previewOtp);
        }
        setInfo(`We've sent a 6-digit verification code to ${email.trim()}. Please enter it below.`);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: OTP Verification Submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Verification failed. Please check your code.');
      } else {
        await fetchSession();
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;
    setError('');
    setInfo('');
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to resend verification code.');
      } else {
        setCooldown(30);
        if (data.previewOtp) {
          setDevOtp(data.previewOtp);
        }
        setInfo('A new verification code has been sent to your email.');
      }
    } catch (err: any) {
      setError('Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '375px' }}>
      {step === 'form' ? (
        <>
          <h1>Create account</h1>

          {error && (
            <div
              style={{
                background: '#fff8f8',
                border: '1px solid #c00',
                color: '#c00',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '14px',
                lineHeight: 1.4,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Your name</label>
              <input
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile number or email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                We will verify that this email exists before creating your account.
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
                ℹ️ Passwords must be at least 6 characters.
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying email domain...' : 'Continue'}
            </button>
          </form>

          <p className="auth-legal">
            By creating an account, you agree to Amazon&apos;s{' '}
            <a href="#" style={{ color: '#007185' }}>
              Conditions of Use
            </a>{' '}
            and{' '}
            <a href="#" style={{ color: '#007185' }}>
              Privacy Notice
            </a>
            .
          </p>

          <div
            style={{
              fontSize: '13px',
              borderTop: '1px solid #eee',
              paddingTop: '14px',
              marginTop: '20px',
            }}
          >
            Already have an account?{' '}
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
              style={{ color: '#007185', textDecoration: 'none' }}
            >
              Sign in ▾
            </Link>
          </div>
        </>
      ) : (
        /* STEP 2: VERIFY EMAIL ADDRESS (AMAZON STYLE) */
        <>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Verify email address</h1>

          <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#333', marginBottom: '16px' }}>
            To verify your email, we&apos;ve sent a One Time Password (OTP) to{' '}
            <strong>{email}</strong>{' '}
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError('');
                setInfo('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007185',
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              (Change)
            </button>
          </p>

          {devOtp && (
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #0284c7',
                color: '#0369a1',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '14px',
                lineHeight: 1.4,
              }}
            >
              <strong>🛠️ Dev Test Mode:</strong> Your OTP code is{' '}
              <span
                style={{
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  background: '#e0f2fe',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                {devOtp}
              </span>
              <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px' }}>
                (Real emails will be sent when SMTP is configured in .env.local)
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#fff8f8',
                border: '1px solid #c00',
                color: '#c00',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {info && !error && (
            <div
              style={{
                background: '#f4fbf5',
                border: '1px solid #2e7d32',
                color: '#1b5e20',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '14px',
              }}
            >
              ✓ {info}
            </div>
          )}

          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  fontSize: '20px',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: 600,
                  padding: '10px',
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || otp.trim().length !== 6}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Verifying...' : 'Create your Amazon account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: cooldown > 0 ? '#888' : '#007185',
                fontSize: '13px',
                cursor: cooldown > 0 ? 'default' : 'pointer',
                textDecoration: cooldown > 0 ? 'none' : 'underline',
              }}
            >
              {resendLoading
                ? 'Sending code...'
                : cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : 'Resend OTP'}
            </button>
          </div>

          <p className="auth-legal" style={{ marginTop: '24px' }}>
            By creating an account, you agree to Amazon&apos;s{' '}
            <a href="#" style={{ color: '#007185' }}>
              Conditions of Use
            </a>{' '}
            and{' '}
            <a href="#" style={{ color: '#007185' }}>
              Privacy Notice
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '20px 0' }}>
      <div className="auth-logo">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          amazon<span style={{ color: '#ff9900' }}>.clone</span>
        </Link>
      </div>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
