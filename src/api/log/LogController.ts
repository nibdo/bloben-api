import { GetLogsResponse } from './LogInterface';
import { NextFunction, Request, Response } from 'express';
import LogService from './LogService';

export const getLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetLogsResponse[] = await LogService.getLogs(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
