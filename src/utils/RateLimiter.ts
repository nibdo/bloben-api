import { RATE_LIMIT } from './enums';
import { Request } from 'express';
import { redisClient } from '../index';

export class RateLimiter {
  static async set(ip: string, req: Request, limit: RATE_LIMIT) {
    await redisClient.set(
      `${ip}-${req.originalUrl}-${req.method}`,
      'rate',
      'PX',
      limit
    );
  }

  static async get(realIP: string, req: Request) {
    return redisClient.get(`${realIP}-${req.originalUrl}-${req.method}`);
  }
}
