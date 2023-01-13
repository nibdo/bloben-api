import { NextFunction, Request, Response } from 'express';

import { LOG_TAG, NODE_ENV } from '../utils/enums';
import { env } from '../index';
import { isCelebrateError } from 'celebrate';
import logger from '../utils/logger';

const handleValidationError = (error: any) => {
  if (isCelebrateError(error)) {
    let message = '';

    for (const item of error.details.values()) {
      message += item.message + ' ';
    }

    return { code: 403, message };
  }

  return null;
};

export default (
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): any => {
  try {
    const validationError = handleValidationError(error);

    if (validationError) {
      return res.status(403).json(validationError).send();
    }

    if (error.appError) {
      return res
        .status(error.code)
        .json({ code: error.code, message: error.message });
    } else {
      if (
        env.nodeEnv === NODE_ENV.DEVELOPMENT ||
        env.nodeEnv === NODE_ENV.TEST ||
        env.isElectron
      ) {
        // eslint-disable-next-line no-console
        console.log(error);
      }

      logger.error(
        'Unknown error',
        error,
        [LOG_TAG.UNKNOWN, LOG_TAG.REST],
        req.method,
        req.originalUrl
      );
      return res
        .status(500)
        .json({ code: 500, message: 'Something went wrong' });
    }
  } catch (e) {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT || env.nodeEnv === NODE_ENV.TEST) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    logger.error(
      'Unknown error',
      e,
      [LOG_TAG.UNKNOWN, LOG_TAG.REST],
      req.method,
      req.originalUrl
    );
    return res.status(500).json({ code: 500, message: 'Something went wrong' });
  }
};
