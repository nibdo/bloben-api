import { NextFunction, Request, Response } from 'express';

import CalendarSettingsService from './CalendarSettingsService';

export const patchCalendarSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await CalendarSettingsService.patchCalendarSettings(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getCalendarSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await CalendarSettingsService.getCalendarSettings(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
