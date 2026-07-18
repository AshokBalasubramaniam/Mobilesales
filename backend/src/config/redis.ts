import Redis from 'ioredis';
import env from './env';
import logger from '../utils/logger';

let client: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (!env.redisUrl) return null;
  if (client) return client;

  client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

  client.on('error', (err: Error) => logger.warn(`Redis error: ${err.message}`));
  client.connect().then(
    () => logger.info('Redis connected'),
    (err: Error) => logger.warn(`Redis connection failed, caching disabled: ${err.message}`)
  );

  return client;
};

export default getRedisClient;
