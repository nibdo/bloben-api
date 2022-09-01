import { GetCalDavCalendar } from 'bloben-interface';
import { NextFunction, Request, Response } from 'express';
import CalDavCalendarService from './CalDavCalendarService';

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

export const createCalDavCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavCalendarService.createCalDavCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateCalDavCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavCalendarService.updateCalDavCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCalDavCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavCalendarService.deleteCalDavCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const patchCalDavCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavCalendarService.patchCalDavCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
