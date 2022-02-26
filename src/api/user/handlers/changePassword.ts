import { Request, Response } from 'express';

import { ChangePasswordRequest } from '../../../bloben-interface/user/user';
import { CommonResponse } from '../../../bloben-interface/interface';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

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
    throw throwError(409, 'Wrong password', req);
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const newPasswordHash = await bcrypt.hashSync(newPassword, salt);

  user.changePassword(newPasswordHash);

  await UserRepository.update(user);

  return createCommonResponse('Password changed');
};
