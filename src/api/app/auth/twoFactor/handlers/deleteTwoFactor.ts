import { Request, Response } from 'express';

import { CommonResponse } from '../../../../../bloben-interface/interface';
import { createCommonResponse } from '../../../../../utils/common';
import { throwError } from '../../../../../utils/errorCodes';
import UserEntity from '../../../../../data/entity/UserEntity';
import UserRepository from '../../../../../data/repository/UserRepository';

/**
 * @param req
 * @param res
 */
export const deleteTwoFactor = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  user.twoFactorSecret = null;
  user.isTwoFactorEnabled = false;

  await UserRepository.update(user);

  return createCommonResponse('Two factor authentication disabled');
};
