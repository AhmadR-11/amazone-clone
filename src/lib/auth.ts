import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ACCESS_SECRET =
  process.env.JWT_SECRET || 'amazon_clone_access_secret_jwt_key_2026';
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'amazon_clone_refresh_secret_jwt_key_2026';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  isGuest?: boolean;
  sessionKey?: string;
  exp?: number;
  iat?: number;
}

// ─── Access Token (15min) ───────────────────────────────────────────────
export function signToken(payload: {
  userId: string;
  email: string;
  name: string;
  isGuest?: boolean;
}): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isGuest: decoded.isGuest || false,
      sessionKey: token,
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch {
    return null;
  }
}

// ─── Refresh Token (30d) ────────────────────────────────────────────────
export function signRefreshToken(payload: {
  userId: string;
  email: string;
  name: string;
}): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyRefreshToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isGuest: false,
    };
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ─────────────────────────────────────────────────────
export function getUserSessionFromCookies(): UserSession | null {
  const cookieStore = cookies();

  // Try access token first
  const accessToken = cookieStore.get('token')?.value;
  if (accessToken) {
    const session = verifyToken(accessToken);
    if (session) return session;
  }

  // Try guest session
  const guestToken = cookieStore.get('guest_session_token')?.value;
  if (guestToken) {
    const guestSession = verifyToken(guestToken);
    if (guestSession) return guestSession;
  }

  return null;
}

export function getRefreshTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('refresh_token')?.value || null;
}

// ─── Guest Session ──────────────────────────────────────────────────────
export function createGuestSessionToken(): {
  token: string;
  session: UserSession;
} {
  const guestId =
    'guest_' +
    Math.random().toString(36).substring(2, 11) +
    Date.now().toString(36);
  const payload = {
    userId: guestId,
    email: 'guest@amazon.clone',
    name: 'Guest User',
    isGuest: true,
  };
  const token = signToken(payload);
  const session = verifyToken(token)!;
  return { token, session };
}

// ─── Session Time Helpers ────────────────────────────────────────────────
export function getSessionTimeRemaining(session: UserSession): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = session.exp || now + 30 * 24 * 3600;
  const remaining = Math.max(0, exp - now);
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
