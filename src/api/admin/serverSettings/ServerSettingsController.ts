import { NextFunction, Request, Response } from 'express';

import ServerSettingsService from './ServerSettingsService';

export const getServerSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await ServerSettingsService.getServerSettings();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getServerSettingsUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await ServerSettingsService.getServerSettingsUser();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const patchServerSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await ServerSettingsService.patchServerSettings(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
