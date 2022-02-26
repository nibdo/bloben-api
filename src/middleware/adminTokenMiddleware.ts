import { NextFunction, Request, Response } from 'express';
import { env } from '../index';
import { throwError } from '../utils/errorCodes';
import jwt from 'jsonwebtoken';

export const adminTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string | string[] = req.headers['token'];

    if (!token) {
      throw throwError(401, 'Not authorized', req);
    }

    try {
      const decodedToken = jwt.verify(token, env.secret.sessionSecret);

      if (!decodedToken?.data?.userID) {
        throw throwError(401, 'Not authorized', req);
      }

      res.locals.userID = decodedToken?.data?.userID;
      res.locals.role = decodedToken?.data?.role;
    } catch (e) {
      throw throwError(401, 'Not authorized', req);
    }

    return next();
  } catch (e) {
    next(e);
  }
};
