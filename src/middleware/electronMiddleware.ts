import { NextFunction, Request, Response } from 'express';

import { ROLE } from '../data/types/enums';
import { SESSION } from '../utils/enums';
import { throwError } from '../utils/errorCodes';
import UserRepository from '../data/repository/UserRepository';

/*
 *  Middleware for local electron app
 */
export const electronMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.headers = {};
    req.headers['content-type'] = 'Application/JSON';

    res.contentType('Application/JSON');

    res.setHeader('content-type', 'Application/JSON');
    // @ts-ignore
    req.session = {};

    const user = await UserRepository.getRepository().findOne({
      where: { role: ROLE.USER },
    });

    if (!user) {
      throw throwError(401, 'Not authorized', req);
    }

    req.session[SESSION.USER_ID] = user.id;
    req.session[SESSION.ROLE] = user.role;

    return next();
  } catch (e) {
    next(e);
  }
};
