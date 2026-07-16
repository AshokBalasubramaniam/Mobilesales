import getRedisClient from '../config/redis';

/**
 * Thin cache wrapper that no-ops when Redis isn't configured, so callers
 * don't need to branch on whether caching is available.
 */
export const get = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client) return null;
  const raw = await client.get(key).catch(() => null);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const set = async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds).catch(() => {});
};

export const del = async (key: string): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;
  await client.del(key).catch(() => {});
};

export const delByPattern = async (pattern: string): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;
  const keys = await client.keys(pattern).catch(() => []);
  if (keys.length) await client.del(...keys);
};
