import { env } from '../index';

export const createRedisConfig = () => ({
  host: env.redis.host,
  port: env.redis.port,
});
