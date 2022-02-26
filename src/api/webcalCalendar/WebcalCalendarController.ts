import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../bloben-interface/interface';
import { GetWebcalCalendarsResponse } from '../../bloben-interface/webcalCalendar/webcalCalendar';
import WebcalCalendarService from './WebcalCalendarService';

export const createWebcalCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await WebcalCalendarService.createWebcalCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getWebcalCalendars = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetWebcalCalendarsResponse[] =
      await WebcalCalendarService.getWebcalCalendars(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateWebcalCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await WebcalCalendarService.updateWebcalCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteWebcalCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await WebcalCalendarService.deleteWebcalCalendar(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
