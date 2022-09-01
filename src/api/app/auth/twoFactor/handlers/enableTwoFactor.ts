import { Request, Response } from 'express';
import { authenticator } from 'otplib';

import { CommonResponse, LoginWithTwoFactorRequest } from 'bloben-interface';
import { createCommonResponse } from '../../../../../utils/common';
import { throwError } from '../../../../../utils/errorCodes';
import UserEntity from '../../../../../data/entity/UserEntity';
import UserRepository from '../../../../../data/repository/UserRepository';

/**
 * @param req
 * @param res
 */
export const enableTwoFactor = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: LoginWithTwoFactorRequest = req.body;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  if (!user.twoFactorSecret) {
    throw throwError(409, 'Missing two factor secret', req);
  }

  // verify otp code
  const isValidCode: boolean = authenticator.check(
    body.otpCode,
    user.twoFactorSecret
  );

  if (!isValidCode) {
    throw throwError(409, 'Wrong code', req);
  }

  user.isTwoFactorEnabled = true;

  await UserRepository.update(user);

  return createCommonResponse('Two factor authentication enabled');
};
