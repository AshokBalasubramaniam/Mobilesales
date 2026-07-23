import getRedisClient from '../config/redis';
import env from '../config/env';

interface Bucket {
  count: number;
  lockCount: number;
  lockUntil: number | null;
}

const emptyBucket = (): Bucket => ({ count: 0, lockCount: 0, lockUntil: null });

// Single-process fallback so brute-force protection still works without
// Redis configured (e.g. local dev); doesn't share state across instances,
// which is why REDIS_URL is expected in production (see .env.example).
const memoryStore = new Map<string, Bucket>();

const loadBucket = async (key: string): Promise<Bucket> => {
  const client = getRedisClient();
  if (client) {
    const raw = await client.get(`bf:${key}`).catch(() => null);
    return raw ? (JSON.parse(raw) as Bucket) : emptyBucket();
  }
  return memoryStore.get(key) ?? emptyBucket();
};

const saveBucket = async (key: string, bucket: Bucket, ttlMs: number): Promise<void> => {
  const client = getRedisClient();
  if (client) {
    await client.set(`bf:${key}`, JSON.stringify(bucket), 'PX', ttlMs).catch(() => {});
    return;
  }
  memoryStore.set(key, bucket);
  setTimeout(() => {
    if (memoryStore.get(key) === bucket) memoryStore.delete(key);
  }, ttlMs).unref();
};

const clearBucket = async (key: string): Promise<void> => {
  const client = getRedisClient();
  if (client) {
    await client.del(`bf:${key}`).catch(() => {});
    return;
  }
  memoryStore.delete(key);
};

export interface AttemptResult {
  locked: boolean;
  lockUntil: Date | null;
  attemptsRemaining: number;
  delayMs: number;
}

/** Returns the active lock expiry for `key`, or null if not currently locked. */
export const checkLock = async (key: string): Promise<Date | null> => {
  const bucket = await loadBucket(key);
  if (bucket.lockUntil && bucket.lockUntil > Date.now()) return new Date(bucket.lockUntil);
  return null;
};

/**
 * Records a failed attempt for `key` (e.g. `acct:<userId>` or `ip:<ip>`).
 * Lock duration doubles on each consecutive lockout (up to lockMaxMs) —
 * escalation resets once a lock naturally expires without a fresh violation,
 * which keeps the bucket schema simple (no separate long-lived counter).
 */
export const registerFailedAttempt = async (key: string): Promise<AttemptResult> => {
  const bucket = await loadBucket(key);
  const now = Date.now();

  if (bucket.lockUntil && bucket.lockUntil > now) {
    return { locked: true, lockUntil: new Date(bucket.lockUntil), attemptsRemaining: 0, delayMs: 0 };
  }

  bucket.count += 1;
  const delayMs = Math.min(bucket.count * env.bruteForce.progressiveDelayMs, 3000);

  if (bucket.count >= env.bruteForce.maxAttempts) {
    const lockDurationMs = Math.min(env.bruteForce.lockBaseMs * 2 ** bucket.lockCount, env.bruteForce.lockMaxMs);
    const lockUntil = now + lockDurationMs;
    await saveBucket(key, { count: 0, lockCount: bucket.lockCount + 1, lockUntil }, lockDurationMs);
    return { locked: true, lockUntil: new Date(lockUntil), attemptsRemaining: 0, delayMs };
  }

  await saveBucket(key, bucket, env.bruteForce.windowMs);
  return { locked: false, lockUntil: null, attemptsRemaining: env.bruteForce.maxAttempts - bucket.count, delayMs };
};

/** Clears all tracked failures for `key` — call on a successful login. */
export const resetAttempts = async (key: string): Promise<void> => {
  await clearBucket(key);
};
