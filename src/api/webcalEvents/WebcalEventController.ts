import { NextFunction, Request, Response } from 'express';
import WebcalEventService from './WebcalEventService';

export const getWebcalEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: any[] = await WebcalEventService.getWebcalEvents(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
