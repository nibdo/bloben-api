import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

import { throwError } from '../utils/errorCodes';

/*
 * Authentication middleware
 */
export const validationMiddleware = (
  schema: Joi.AnySchema
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return (req, res, next) => {
    try {
      const result: any = schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        { abortEarly: false }
      );

      if (result.error) {
        throw throwError(403, `Validation error: ${result.error.message}`, req);
      }

      return next();
    } catch (e) {
      return next(e);
    }
  };
};
