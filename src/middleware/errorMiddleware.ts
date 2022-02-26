import { NextFunction, Request, Response } from 'express';

import { NODE_ENV } from '../utils/enums';
import { env } from '../index';
import logger from '../utils/logger';

export default (
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): any => {
  try {
    return res
      .status(error.code)
      .json({ code: error.code, message: error.message })
      .send();
    if (error.appError) {
      return res
        .status(error.code)
        .json({ code: error.code, message: error.message })
        .send();
    } else {
      if (
        env.nodeEnv === NODE_ENV.DEVELOPMENT ||
        env.nodeEnv === NODE_ENV.TEST
      ) {
        // eslint-disable-next-line no-console
        console.log(error);
      }

      logger.error('Unknown error', error, req.method, req.originalUrl);
      return res
        .status(500)
        .json({ code: 500, message: 'Something went wrong' })
        .send();
    }
  } catch (e) {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT || env.nodeEnv === NODE_ENV.TEST) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    logger.error('Unknown error', e, req.method, req.originalUrl);
    return res
      .status(500)
      .json({ code: 500, message: 'Something went wrong' })
      .send();
  }
};
