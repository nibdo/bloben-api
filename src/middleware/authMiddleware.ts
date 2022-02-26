import { NextFunction, Request, Response } from 'express';

import { ROLE } from '../bloben-interface/enums';
import { SESSION } from '../utils/enums';
import { throwError } from '../utils/errorCodes';
import UserEntity from '../data/entity/UserEntity';

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
