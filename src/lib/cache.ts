/**
 * Cache layer — pure in-memory TTL Map (Redis not bundled to avoid webpack issues).
 * For production Redis support, run a separate cache microservice.
 */

type CacheEntry = { value: string; expiresAt: number };

const memoryCache = new Map<string, CacheEntry>();

// Periodically clean expired entries (every 5 minutes)
if (typeof globalThis !== 'undefined' && typeof setInterval !== 'undefined') {
  // Use a module-level singleton to avoid multiple intervals in dev HMR
  const g = globalThis as typeof globalThis & { _cacheCleanupInterval?: ReturnType<typeof setInterval> };
  if (!g._cacheCleanupInterval) {
    g._cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of memoryCache.entries()) {
        if (entry.expiresAt <= now) memoryCache.delete(key);
      }
    }, 5 * 60 * 1000);
    // Don't block process exit
    if (typeof g._cacheCleanupInterval?.unref === 'function') {
      (g._cacheCleanupInterval as NodeJS.Timeout).unref();
    }
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheDel(key: string): Promise<void> {
  memoryCache.delete(key);
}

export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
}

export async function cacheFlushPattern(pattern: string): Promise<void> {
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) memoryCache.delete(key);
  }
}
