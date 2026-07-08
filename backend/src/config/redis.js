const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let client = null;

const getRedisClient = () => {
  if (!env.redisUrl) return null;
  if (client) return client;

  client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

  client.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
  client.connect().then(
    () => logger.info('Redis connected'),
    (err) => logger.warn(`Redis connection failed, caching disabled: ${err.message}`)
  );

  return client;
};

module.exports = getRedisClient;
