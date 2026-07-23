interface Bucket {
  count: number;
  resetAt: number;
  violations: number;
}

const buckets = new Map<string, Bucket>();

// A chat/typing/signaling socket legitimately fires bursts of events, so this
// is deliberately looser than the HTTP rate limiters in rateLimiter.middleware.ts.
const WINDOW_MS = 10_000;
const MAX_EVENTS_PER_WINDOW = 30;
const MAX_VIOLATIONS_BEFORE_DISCONNECT = 5;

export interface RateLimitResult {
  limited: boolean;
  shouldDisconnect: boolean;
}

export const registerSocketEvent = (socketId: string): RateLimitResult => {
  const now = Date.now();
  let bucket = buckets.get(socketId);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS, violations: 0 };
    buckets.set(socketId, bucket);
  }

  bucket.count += 1;
  if (bucket.count <= MAX_EVENTS_PER_WINDOW) return { limited: false, shouldDisconnect: false };

  bucket.violations += 1;
  return { limited: true, shouldDisconnect: bucket.violations >= MAX_VIOLATIONS_BEFORE_DISCONNECT };
};

export const clearSocketRateLimit = (socketId: string): void => {
  buckets.delete(socketId);
};
