import { NextFunction, Request, Response } from 'express';
import LogService from './LogService';

export const getLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await LogService.getLogs(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getLogTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await LogService.getLogTags();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getLogDates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await LogService.getLogDates();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
