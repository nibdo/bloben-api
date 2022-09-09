import { RedisOptions } from 'ioredis/built/redis/RedisOptions';

export const createRedisConfig = (): RedisOptions => {
  const config: RedisOptions = {};

  if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    config.host = process.env.REDIS_HOST;
    config.port = Number(process.env.REDIS_PORT);
  } else {
    throw Error('Invalid redis config');
  }

  return config;
};
