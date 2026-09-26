'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';
import AuthMascot from '@/components/AuthMascot';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/';
  const { fetchSession } = useAuthStore();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Mascot Focus States
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
        setInfo(`Verification code dispatched to ${email.trim()}. Please enter it below.`);
      }
    } catch {
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
        setError(data.message || data.error || 'Verification failed. Please check your 6-digit code.');
      } else {
        await fetchSession();
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
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
        setInfo('A new 6-digit code has been dispatched to your email.');
      }
    } catch {
      setError('Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Interactive Mascot Animator */}
      <AuthMascot
        isEmailFocused={isEmailFocused}
        isPasswordFocused={isPasswordFocused}
        isPasswordVisible={showPassword}
      />

      {step === 'form' ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans tracking-tight mb-1.5">
              Create Your Account
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Join LUXESTORE for VIP member perks, wishlist vaults, and express checkout.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-medium">
              <span className="font-bold">Error:</span> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Full Name
              </label>
              <input
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-950 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-950 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-950 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowPassword((prev) => !prev);
                    passwordInputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Initiating Verification...' : 'CONTINUE TO VERIFICATION'}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already registered?{' '}
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="text-blue-600 hover:text-blue-700 font-black hover:underline cursor-pointer ml-0.5"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="text-center space-y-2 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-2">
              <KeyRound size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-950 font-sans tracking-tight">
              Verify Email Address
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
              Code sent to <strong className="text-slate-900">{email}</strong>{' '}
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
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-2xl">
              <strong>Dev Test OTP Code:</strong>{' '}
              <span className="font-bold tracking-widest bg-amber-200 px-2 py-0.5 rounded text-amber-950 font-mono">{devOtp}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2">
              <span className="font-bold">Error:</span> <span>{error}</span>
            </div>
          )}

          {info && !error && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" /> <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-2 uppercase tracking-wider text-center font-mono">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full py-3.5 text-center text-2xl tracking-[0.5em] font-black rounded-2xl border border-slate-200 bg-white text-slate-950 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading || otp.trim().length !== 6}
            >
              <span>{loading ? 'Verifying Code...' : 'COMPLETE REGISTRATION'}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resendLoading}
              className="text-xs text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline font-extrabold cursor-pointer"
            >
              {resendLoading
                ? 'Sending Code...'
                : cooldown > 0
                ? `Resend OTP Code in ${cooldown}s`
                : 'Resend Verification Code'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050b18] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Liquid Radial Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-blue-500/15 blur-[120px] pointer-events-none" />

      {/* Main Split-Stage Floating Glass Container */}
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] border border-white/50 overflow-hidden flex flex-col lg:flex-row relative z-10 my-6">
        
        {/* Left Panel: Deep Dark Liquid Media Stage */}
        <div className="lg:w-[45%] bg-slate-950/95 p-8 sm:p-10 lg:p-12 relative flex flex-col justify-between overflow-hidden text-white min-h-[380px] lg:min-h-[540px] border-r border-white/10">
          {/* Liquid Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/80 to-slate-950 opacity-95" />
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600/25 blur-[90px] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white font-sans leading-none">
                  LUXE<span className="text-blue-400">STORE</span>
                </span>
                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                  Premium Retail
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Display Story */}
          <div className="relative z-10 my-auto py-8">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono mb-3">
              JOIN THE CLUB
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-sans tracking-tight leading-tight mb-4">
              Your Next Journey Starts Here
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
              Create an account to unlock exclusive member pricing, private vault releases, &amp; express 1-click checkout.
            </p>
          </div>

          {/* Bottom Trust Badge Pill */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-bold text-slate-300">
            <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full">
              Global Express
            </span>
          </div>
        </div>

        {/* Right Panel: Frosted Glass Form Console */}
        <div className="lg:w-[55%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white/95 backdrop-blur-xl">
          <Suspense fallback={<div className="text-center text-slate-500 text-xs py-8">Loading registration console...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
