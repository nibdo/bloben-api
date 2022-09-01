import { Request, Response } from 'express';

import { ChangePasswordRequest, CommonResponse } from 'bloben-interface';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../utils/logger';

export const changePassword = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: ChangePasswordRequest = req.body;
  const { userID } = res.locals;
  const { newPassword, oldPassword } = body;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  let isPasswordMatching = false;

  // compare hashed password
  isPasswordMatching = await bcrypt.compare(oldPassword, user.hash);

  if (!isPasswordMatching) {
    logger.warn(`User wrong changed password`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);
    throw throwError(409, 'Wrong password', req);
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const newPasswordHash = await bcrypt.hashSync(newPassword, salt);

  user.changePassword(newPasswordHash);

  await UserRepository.update(user);

  return createCommonResponse('Password changed');
};
