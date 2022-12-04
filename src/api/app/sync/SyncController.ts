import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { getSync } from './handlers/getSync';
import { syncEmails } from './handlers/syncEmails';

export const getSyncController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await getSync(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
export const syncEmailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await syncEmails(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
