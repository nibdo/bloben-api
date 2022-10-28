import { NextFunction, Request, Response } from 'express';

import CalDavTaskService from './CalDavTaskService';

export const getCalDavTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.getCalDavTasks(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getLatestCalDavTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.getLatestCalDavTasks(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
