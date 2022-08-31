import { NextFunction, Request, Response } from 'express';

import CalDavTaskSettingsService from './CalDavTaskSettingsService';

export const updateCalDavTaskSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskSettingsService.updateCalDavTaskSettings(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getCalDavTaskSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskSettingsService.getCalDavTaskSettings(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
