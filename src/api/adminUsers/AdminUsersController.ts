import { CommonResponse } from '../../bloben-interface/interface';
import { GetUsersResponse } from '../../bloben-interface/admin/admin';
import { NextFunction, Request, Response } from 'express';
import AdminUsersService from './AdminUsersService';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetUsersResponse[] = await AdminUsersService.getUsers();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const adminCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AdminUsersService.adminCreateUser(
      req
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await AdminUsersService.adminUpdateUser(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
