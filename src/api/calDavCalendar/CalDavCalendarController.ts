import { GetCalDavCalendar } from '../../bloben-interface/calDavCalendar/calDavCalendar';
import { NextFunction, Request, Response } from 'express';
import CalDavCalendarService from '../calDavCalendar/CalDavCalendarService';

export const getCalDavCalendars = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetCalDavCalendar[] =
      await CalDavCalendarService.getCalDavCalendars(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const syncCalDavCalendars = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).send();

    await CalDavCalendarService.syncCalDavCalendars(req, res);
  } catch (error) {
    next(error);
  }
};
