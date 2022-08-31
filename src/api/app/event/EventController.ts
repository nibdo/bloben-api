import { NextFunction, Request, Response } from 'express';

import EventService from './EventService';

export const getEventsInRange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: unknown = await EventService.getEventsInRange(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getCachedEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: any = await EventService.getCachedEvents(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const searchEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await EventService.searchEvents(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await EventService.getEvent(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
