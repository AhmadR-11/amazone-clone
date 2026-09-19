'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

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
    <div className="auth-container">
      <h1>Sign in</h1>

      {error && (
        <div style={{ background: '#fff8f8', border: '1px solid #c00', color: '#c00', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '14px', lineHeight: 1.4 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-legal">
        By continuing, you agree to Amazon&apos;s <a href="#" style={{ color: '#007185' }}>Conditions of Use</a> and <a href="#" style={{ color: '#007185' }}>Privacy Notice</a>.
      </p>

      <div className="auth-divider">
        <span>New to Amazon?</span>
      </div>

      <Link href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`} className="create-account-btn">
        Create your Amazon account
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '20px 0' }}>
      <div className="auth-logo">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          amazon<span style={{ color: '#ff9900' }}>.clone</span>
        </Link>
      </div>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}


