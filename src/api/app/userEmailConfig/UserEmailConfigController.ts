import { NextFunction, Request, Response } from 'express';

import UserEmailConfigService from './UserEmailConfigService';

export const createUserEmailConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.createUserEmailConfig(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

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

export const patchUserEmailConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.patchUserEmailConfig(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getUserEmailConfigs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await UserEmailConfigService.getUserEmailConfigs(req, res);

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
