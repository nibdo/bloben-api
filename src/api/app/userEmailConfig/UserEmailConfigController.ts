import { NextFunction, Request, Response } from 'express';

import UserEmailConfigService from './UserEmailConfigService';

export const updateUserEmailConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.updateUserEmailConfig(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getUserEmailConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.getUserEmailConfig(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUserEmailConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.deleteUserEmailConfig(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
