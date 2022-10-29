import { AdminUpdateUserRequest, CommonResponse } from 'bloben-interface';
import { ROLE } from '../../../../data/types/enums';
import { Request, Response } from 'express';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import { validateUsername } from './adminCreateUser';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const adminUpdateUser = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { params } = req;
  const { userID } = res.locals;
  const { id } = params;
  const body: AdminUpdateUserRequest = req.body;

  const user: UserEntity | undefined = await UserRepository.findById(id);

  const data: any = {};

  if (!user) {
    throw throwError(404, 'User not found');
  }

  if (id === userID || (user.role === ROLE.ADMIN && body.password)) {
    throw throwError(409, 'Cannot update self');
  }

  if (user.role === ROLE.ADMIN) {
    throw throwError(409, 'Cannot set admin role');
  }

  if (body.username) {
    validateUsername(body.username);

    const user = await UserRepository.findByUsername(body.username);

    if (user) {
      throw throwError(409, 'User already exist');
    }
  }

  if (body.password) {
    // hash user password
    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(body.password, salt);

    data.hash = hash;

    delete body.password;
  }

  await UserRepository.getRepository().update(user.id, { ...body, ...data });

  return createCommonResponse('User updated');
};
