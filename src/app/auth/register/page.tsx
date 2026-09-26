'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Sparkles, ArrowRight, Lock, Mail, User, KeyRound, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {step === 'form' ? (
        <>
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Create Your Account</h1>
            <p className="text-xs text-slate-500">Join LUXESTORE for exclusive member perks &amp; fast checkout.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="First and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors" disabled={loading}>
              {loading ? 'Verifying Email...' : 'Continue to Verification'}
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="relative my-6 text-center border-t border-slate-100 pt-4">
            <span className="text-[11px] text-slate-500 font-medium">Already registered?</span>
          </div>

          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-2.5 rounded-xl text-xs border border-slate-200 transition-colors"
          >
            Sign In Instead
          </Link>
        </>
      ) : (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center mx-auto mb-2">
              <KeyRound size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Verify Email Address</h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We sent a 6-digit code to <strong className="text-slate-900">{email}</strong>{' '}
              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); setInfo(''); }}
                className="text-blue-600 hover:underline font-bold"
              >
                (Change)
              </button>
            </p>
          </div>

          {devOtp && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-xl">
              <strong>🛠️ Dev Test OTP Code:</strong>{' '}
              <span className="font-bold tracking-widest bg-amber-200 px-2 py-0.5 rounded text-amber-950 font-mono">{devOtp}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          {info && !error && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600" /> <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider text-center">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full py-3 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              disabled={loading || otp.trim().length !== 6}
            >
              {loading ? 'Verifying Code...' : 'Complete Registration'}
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resendLoading}
              className="text-xs text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline font-semibold"
            >
              {resendLoading
                ? 'Sending Code...'
                : cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : 'Resend OTP Code'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base font-display">
          L
        </div>
        <span className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
          LUXESTORE
        </span>
      </Link>

      <Suspense fallback={<div className="text-center text-slate-500 text-xs">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
