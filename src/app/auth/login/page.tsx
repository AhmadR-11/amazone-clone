'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('returnUrl') || searchParams?.get('redirect') || '/';
  const { fetchSession } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError(data.message || data.error || 'Invalid email or password');
      } else {
        await fetchSession();
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Sign In to Your Account</h1>
        <p className="text-xs text-slate-500">Access your saved wishlist, orders, and express checkout.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <span>⚠️</span> <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors" disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight size={15} />
        </button>
      </form>

      <div className="relative my-6 text-center border-t border-slate-100 pt-4">
        <span className="text-[11px] text-slate-500 font-medium">New to LUXESTORE?</span>
      </div>

      <Link
        href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
        className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-2.5 rounded-xl text-xs border border-slate-200 transition-colors"
      >
        Create a New Account
      </Link>
    </div>
  );
}

export default function LoginPage() {
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
        <LoginForm />
      </Suspense>
    </div>
  );
}
