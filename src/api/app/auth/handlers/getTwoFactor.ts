import { Request, Response } from 'express';

import { GetTwoFactorResponse } from 'bloben-interface';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

/**
 * @param req
 * @param res
 */
export const getTwoFactor = async (
  req: Request,
  res: Response
): Promise<GetTwoFactorResponse> => {
  const { userID } = res.locals;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  return {
    isEnabled: user.isTwoFactorEnabled,
  };
};
