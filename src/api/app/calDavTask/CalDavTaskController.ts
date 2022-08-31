import { NextFunction, Request, Response } from 'express';

import CalDavTaskService from './CalDavTaskService';

export const syncCalDavTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.syncCalDavTasks(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const createCalDavTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.createCalDavTask(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCalDavTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.deleteCalDavTask(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateCalDavTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await CalDavTaskService.updateCalDavTask(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

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
