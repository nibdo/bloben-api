import { NextFunction, Request, Response } from 'express';

import { RATE_LIMIT } from '../utils/enums';
import { RateLimiter } from '../utils/RateLimiter';
import { throwError } from '../utils/errorCodes';

const X_REAL_IP = 'X-Real-IP';

export const rateLimiterMiddleware = (
  limit: RATE_LIMIT
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return async (req, res, next) => {
    try {
      const realIP: string = req.header(X_REAL_IP);

      if (realIP) {
        const record: any = await RateLimiter.get(realIP, req);

        if (record) {
          throw throwError(429, 'Too many requests', req);
        } else {
          await RateLimiter.set(realIP, req, limit);

          return next();
        }
      }

      return next();
    } catch (e) {
      return next(e);
    }
  };
};
