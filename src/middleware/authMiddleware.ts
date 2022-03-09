import { NextFunction, Request, Response } from 'express';

import { LOG_TAG, SESSION } from '../utils/enums';
import { ROLE } from '../bloben-interface/enums';
import { throwError } from '../utils/errorCodes';
import UserEntity from '../data/entity/UserEntity';
import logger from '../utils/logger';

/*
 * Authentication middleware
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID: string = req.session[SESSION.USER_ID];
    const role: string = req.session[SESSION.ROLE];

    if (!userID || !role) {
      logger.warn(`Login no session data`, [LOG_TAG.REST, LOG_TAG.SECURITY]);
      throw throwError(401, 'Not authorized', req);
    }

    res.locals.userID = userID;
    const sessionUser: UserEntity = new UserEntity(null);
    res.locals.user = sessionUser.createSessionUser(userID, role as ROLE);

    return next();
  } catch (e) {
    next(e);
  }
};
