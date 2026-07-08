const getRedisClient = require('../config/redis');

/**
 * Thin cache wrapper that no-ops when Redis isn't configured, so callers
 * don't need to branch on whether caching is available.
 */
const get = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  const raw = await client.get(key).catch(() => null);
  return raw ? JSON.parse(raw) : null;
};

const set = async (key, value, ttlSeconds = 300) => {
  const client = getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds).catch(() => {});
};

const del = async (key) => {
  const client = getRedisClient();
  if (!client) return;
  await client.del(key).catch(() => {});
};

const delByPattern = async (pattern) => {
  const client = getRedisClient();
  if (!client) return;
  const keys = await client.keys(pattern).catch(() => []);
  if (keys.length) await client.del(...keys);
};

module.exports = { get, set, del, delByPattern };
