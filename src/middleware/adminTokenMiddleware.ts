import { LOG_TAG } from '../utils/enums';
import { NextFunction, Request, Response } from 'express';
import { env } from '../index';
import { throwError } from '../utils/errorCodes';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const adminTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string | string[] = req.headers['token'];

    if (!token) {
      logger.warn(`Admin login no token`, [LOG_TAG.REST, LOG_TAG.SECURITY]);

      throw throwError(401, 'Not authorized', req);
    }

    try {
      const decodedToken = jwt.verify(token, env.secret.sessionSecret);

      if (!decodedToken?.data?.userID) {
        logger.warn(`Admin login wrong token`, [
          LOG_TAG.REST,
          LOG_TAG.SECURITY,
        ]);
        throw throwError(401, 'Not authorized', req);
      }

      res.locals.userID = decodedToken?.data?.userID;
      res.locals.role = decodedToken?.data?.role;
    } catch (e) {
      logger.warn(`Admin login unknown error`, [
        LOG_TAG.REST,
        LOG_TAG.SECURITY,
      ]);
      throw throwError(401, 'Not authorized', req);
    }

    return next();
  } catch (e) {
    next(e);
  }
};
