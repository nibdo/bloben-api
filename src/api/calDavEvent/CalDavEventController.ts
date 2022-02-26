import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../bloben-interface/interface';
import { SyncResponse } from '../../common/interface/common';
import CalDavEventService from './CalDavEventService';

export const createCalDavEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await CalDavEventService.createCalDavEvent(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateCalDavEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await CalDavEventService.updateCalDavEvent(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCalDavEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await CalDavEventService.deleteCalDavEvent(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const syncCalDavEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: SyncResponse = await CalDavEventService.syncCalDavEvents(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
