import { NextFunction, Request, Response } from 'express';

import TwoFactorService from './TwoFactorService';

export const loginWithTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await TwoFactorService.loginWithTwoFactor(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const generateTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await TwoFactorService.generateTwoFactorSecret(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const enableTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await TwoFactorService.enableTwoFactor(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await TwoFactorService.deleteTwoFactor(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
