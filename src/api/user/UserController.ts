import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../bloben-interface/interface';
import {
  GetAccountResponse,
  GetSessionResponse,
  GetTwoFactorResponse,
  GetTwoFactorSecretResponse,
  LoginResponse,
} from '../../bloben-interface/user/user';
import UserService from './UserService';

export const loginAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: LoginResponse = await UserService.login(req);

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
    await UserService.loginDemo(req, res);
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
    const response: LoginResponse = await UserService.loginWithTwoFactor(req);

    res.status(200).send(response);
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
    const response: CommonResponse = await UserService.changePassword(req, res);

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
    const response: GetSessionResponse = await UserService.getSession(req);

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
    const response: GetAccountResponse = await UserService.getAccount(req, res);

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
    const response: CommonResponse = await UserService.deleteUser(req, res);

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
    const response: CommonResponse = await UserService.logout(req);

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
    const response: GetTwoFactorSecretResponse =
      await UserService.generateTwoFactorSecret(req, res);

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
    const response: CommonResponse = await UserService.enableTwoFactor(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetTwoFactorResponse = await UserService.getTwoFactor(
      req,
      res
    );

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
    const response: CommonResponse = await UserService.deleteTwoFactor(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
