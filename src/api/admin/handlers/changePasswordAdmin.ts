import { AdminChangePasswordRequest } from '../../../bloben-interface/admin/admin';
import { CommonResponse } from '../../../bloben-interface/interface';
import { Request, Response } from 'express';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const changePasswordAdmin = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: AdminChangePasswordRequest = req.body;
  const { oldPassword, password } = body;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  const isOldPasswordMatching: boolean = await bcrypt.compare(
    oldPassword,
    user.hash
  );

  if (!isOldPasswordMatching) {
    throw throwError(401, 'Wrong password', req);
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  user.hash = await bcrypt.hashSync(password, salt);

  await UserRepository.update(user);

  return createCommonResponse();
};
