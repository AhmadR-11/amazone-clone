'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Create account</h1>

      {error && (
        <div style={{ background: '#fff8f8', border: '1px solid #c00', color: '#c00', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          {loading ? 'Creating Account...' : 'Create your Amazon account'}
        </button>
      </form>

      <p className="auth-legal">
        By creating an account, you agree to Amazon's <a href="#" style={{ color: '#007185' }}>Conditions of Use</a> and <a href="#" style={{ color: '#007185' }}>Privacy Notice</a>.
      </p>

      <div style={{ fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '20px' }}>
        Already have an account? <Link href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`} style={{ color: '#007185' }}>Sign in ▾</Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '20px 0' }}>
      <div className="auth-logo">
        amazon<span style={{ color: '#ff9900' }}>.clone</span>
      </div>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
