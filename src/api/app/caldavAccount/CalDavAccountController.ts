import { CommonResponse, GetCalDavAccountResponse } from 'bloben-interface';
import { NextFunction, Request, Response } from 'express';
import CalDavAccountService from './CalDavAccountService';

export const createCalDavAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await CalDavAccountService.createCalDavAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getCalDavAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetCalDavAccountResponse =
      await CalDavAccountService.getCalDavAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const getCalDavAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetCalDavAccountResponse[] =
      await CalDavAccountService.getCalDavAccounts(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateCalDavAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await CalDavAccountService.updateCalDavAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCalDavAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await CalDavAccountService.deleteCalDavAccount(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
