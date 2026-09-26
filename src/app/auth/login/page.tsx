'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthMascot from '@/components/AuthMascot';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('returnUrl') || searchParams?.get('redirect') || '/';
  const { fetchSession } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Mascot Focus States
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Invalid email address or password.');
      } else {
        await fetchSession();
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected connection error occurred. Please try again.');
    } finally {
      setLoading(false);
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

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans tracking-tight mb-1.5">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Enter your email and password to access your account.
        </p>
      </div>

      {error && (
        <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-medium">
          <span className="font-bold">Error:</span> <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span className="text-xs font-bold text-slate-600">Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
        >
          <span>{loading ? 'Authenticating...' : 'SIGN IN'}</span>
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-blue-600 hover:text-blue-700 font-black hover:underline cursor-pointer ml-0.5"
          >
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
              MEMBER PORTAL
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-sans tracking-tight leading-tight mb-4">
              Get Everything You Want
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
              Access your personalized wishlist, express one-click checkout, and order history seamlessly.
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
          <Suspense fallback={<div className="text-center text-slate-500 text-xs py-8">Loading authentication console...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
