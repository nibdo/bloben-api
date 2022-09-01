import { NextFunction, Request, Response } from 'express';

import {
  CommonResponse,
  GetAccountResponse,
  GetSessionResponse,
  LoginResponse,
} from 'bloben-interface';
import AuthService from './AuthService';

export const loginAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: LoginResponse = await AuthService.login(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const loginDemo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await AuthService.loginDemo(req, res);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AuthService.changePassword(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetSessionResponse = await AuthService.getSession(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetAccountResponse = await AuthService.getAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AuthService.deleteUser(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AuthService.logout(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
