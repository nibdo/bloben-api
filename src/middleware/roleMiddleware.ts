import { NextFunction, Request, Response } from 'express';
import { forEach } from 'lodash';
import dotenv from 'dotenv';

import { SESSION } from '../utils/enums';
import { USER_ROLE } from '../api/app/auth/UserEnums';
import { throwError } from '../utils/errorCodes';

dotenv.config();

/*
 * Authentication middleware
 */
export const roleMiddleware = (
  roles: USER_ROLE[]
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return (req, res, next) => {
    try {
      const userRole: string = req.session?.[SESSION.ROLE] || res.locals.role;

      if (!userRole) {
        throw throwError(403, 'Access forbidden', req);
      }

      let isAllowed = false;

      forEach(roles, (role) => {
        if (role === userRole) {
          isAllowed = true;
        }
      });

      if (!isAllowed) {
        throw throwError(403, 'Access forbidden', req);
      }

      return next();
    } catch (e) {
      next(e);
    }
  };
};
