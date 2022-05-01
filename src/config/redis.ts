import { env } from '../index';

export const createRedisConfig = () => {
  const config: {
    host?: string;
    port?: string;
    url?: string;
  } = {};

  if (env.redis.url) {
    config.url = env.redis.url;
  } else if (env.redis.port && env.redis.host) {
    config.host = env.redis.host;
    config.port = env.redis.port;
  } else {
    throw Error('Invalid redis config');
  }

  return config;
};
