import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

import { LOG_TAG } from '../utils/enums';
import { throwError } from '../utils/errorCodes';
import UserEntity from '../data/entity/UserEntity';
import UserRepository from '../data/repository/UserRepository';
import logger from '../utils/logger';

dotenv.config();

/*
 * Authentication middleware
 */
export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID: string = res.locals.userID;

    if (!userID) {
      logger.warn(`Login no session user`, [LOG_TAG.REST, LOG_TAG.SECURITY]);
      throw throwError(401, 'Not authorized', req);
    }

    const user: UserEntity | undefined = await UserRepository.getUserForAuth(
      userID
    );

    if (!user) {
      throw throwError(401, 'Not authorized', req);
    }

    res.locals.user = user;

    return next();
  } catch (e) {
    next(e);
  }
};
