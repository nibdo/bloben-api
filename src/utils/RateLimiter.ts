import { MemoryClient } from '../service/init';
import { RATE_LIMIT } from './enums';
import { Request } from 'express';
import { isElectron } from '../config/env';

export class RateLimiter {
  static async set(ip: string, req: Request, limit: RATE_LIMIT) {
    if (isElectron) {
      return;
    }

    await MemoryClient.set(
      `${ip}-${req.originalUrl}-${req.method}`,
      'rate',
      'PX',
      limit
    );
  }

  static async get(realIP: string, req: Request) {
    return MemoryClient.get(`${realIP}-${req.originalUrl}-${req.method}`);
  }
}
