import { AdminCreateUserRequest } from '../../../bloben-interface/admin/admin';
import { CommonResponse } from '../../../bloben-interface/interface';
import { Request } from 'express';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const adminCreateUser = async (
  req: Request
): Promise<CommonResponse> => {
  const body: AdminCreateUserRequest = req.body;

  const user: UserEntity | undefined = await UserRepository.findByUsername(
    body.username
  );

  if (user) {
    throw throwError(409, 'User already exist');
  }

  const newUser: UserEntity = new UserEntity(body);

  // hash user password
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  newUser.hash = await bcrypt.hashSync(body.password, salt);

  await UserRepository.getRepository().save(newUser);

  return createCommonResponse('User created');
};
