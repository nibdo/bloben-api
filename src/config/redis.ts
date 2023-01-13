import { RedisOptions } from 'ioredis';

export const createRedisConfig = (): any => {
  let config: RedisOptions = {};

  const url = process.env.REDIS_URL ?? null;
  if (url) {
    if (!url.startsWith('ioredis://')) {
      // For REDIS_URL you can either specify an ioredis compatible url like this
      // REDIS_URL=redis://user:password@host:port/db
      return process.env.REDIS_URL;
    } else {
      try {
        // Redis connection args can be provided as a base64 encoded JSON object
        // instead of manually passing any of the many individual options one by one.
        // ie, Redis Sentinel connection object: {"sentinels":[{"host":"sentinel-0","port":26379},{"host":"sentinel-1","port":26379}],"name":"mymaster"}
        // to base64 variable:
        // REDIS_URL=ioredis://eyJzZW50aW5lbHMiOlt7Imhvc3QiOiJzZW50aW5lbC0wIiwicG9ydCI6MjYzNzl9LHsiaG9zdCI6InNlbnRpbmVsLTEiLCJwb3J0IjoyNjM3OX1dLCJuYW1lIjoibXltYXN0ZXIifQ==
        const decodedString = Buffer.from(
          process.env.REDIS_SENTINEL_URL.slice(10),
          'base64'
        ).toString();

        config = JSON.parse(decodedString);
      } catch (error) {
        throw new Error(`Failed to decode redis adapter options: ${error}`);
      }
    }
  } else if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    config.host = process.env.REDIS_HOST;
    config.port = Number(process.env.REDIS_PORT);
  } else {
    // console.log('missing redis config');
    // throw Error('Invalid redis config');
  }

  return config;
};
