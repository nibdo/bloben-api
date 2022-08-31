import { NextFunction, Request, Response } from 'express';

import TimezoneService from './TimezoneService';

export const getTimezones = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: string[] = await TimezoneService.getTimezones();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
