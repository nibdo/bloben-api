import { RedisOptions } from 'ioredis';

export const createRedisConfig = (): any => {
  const config: RedisOptions = {};

  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  } else if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    config.host = process.env.REDIS_HOST;
    config.port = Number(process.env.REDIS_PORT);
  } else {
    // console.log('missing redis config');
    // throw Error('Invalid redis config');
  }

  return config;
};
