import {
  CommonResponse,
  GetAdminAccountResponse,
  LoginResponse,
} from 'bloben-interface';
import { NextFunction, Request, Response } from 'express';
import AdminService from './AdminService';

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: LoginResponse = await AdminService.loginAdmin(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getAdminAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetAdminAccountResponse =
      await AdminService.getAdminAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const changePasswordAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AdminService.changePasswordAdmin(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AdminService.logoutAdmin(req);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
