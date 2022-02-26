import { Request, Response } from 'express';
import { authenticator } from 'otplib';

import { GetTwoFactorSecretResponse } from '../../../bloben-interface/user/user';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';

/**
 * @param req
 * @param res
 */
export const generateTwoFactorSecret = async (
  req: Request,
  res: Response
): Promise<GetTwoFactorSecretResponse> => {
  const { userID } = res.locals;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  const secret = authenticator.generateSecret();

  user.twoFactorSecret = secret;

  await UserRepository.update(user);

  return {
    twoFactorSecret: secret,
  };
};
