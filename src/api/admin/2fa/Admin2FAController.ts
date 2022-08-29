import { NextFunction, Request, Response } from 'express';
import Admin2FAService from './Admin2FAService';

export const deleteTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await Admin2FAService.deleteTwoFactor(req, res);

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
    const response = await Admin2FAService.enableTwoFactor(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const generateTwoFactorSecret = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await Admin2FAService.generateTwoFactorSecret(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const loginWithTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await Admin2FAService.loginWithTwoFactor(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
