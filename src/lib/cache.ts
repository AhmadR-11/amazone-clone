/**
 * Cache layer — Redis when REDIS_URL is set, otherwise in-memory TTL Map.
 * Interface: get / set / del
 */

type CacheEntry = { value: string; expiresAt: number };

const memoryCache = new Map<string, CacheEntry>();

// Periodically clean expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt <= now) memoryCache.delete(key);
    }
  }, 5 * 60 * 1000);
}

async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  try {
    const req = eval('require');
    const { createClient } = req('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  // Try Redis first
  const redis = await getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(key);
      await redis.disconnect();
      return val;
    } catch {
      await redis.disconnect().catch(() => {});
    }
  }

  // In-memory fallback
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.setEx(key, ttlSeconds, value);
      await redis.disconnect();
      return;
    } catch {
      await redis.disconnect().catch(() => {});
    }
  }

  // In-memory fallback
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(key);
      await redis.disconnect();
      return;
    } catch {
      await redis.disconnect().catch(() => {});
    }
  }
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
