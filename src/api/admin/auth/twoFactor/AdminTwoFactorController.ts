import { NextFunction, Request, Response } from 'express';
import AdminTwoFactorService from './AdminTwoFactorService';

export const deleteTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await AdminTwoFactorService.deleteTwoFactor(req, res);

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
    const response = await AdminTwoFactorService.enableTwoFactor(req, res);

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
    const response = await AdminTwoFactorService.generateTwoFactorSecret(
      req,
      res
    );

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
    const response = await AdminTwoFactorService.loginWithTwoFactor(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
