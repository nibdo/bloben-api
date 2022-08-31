import { AdminUpdateUserRequest } from '../../../../bloben-interface/admin/admin';
import { CommonResponse } from '../../../../bloben-interface/interface';
import { ROLE } from '../../../../bloben-interface/enums';
import { Request, Response } from 'express';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const adminUpdateUser = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { params } = req;
  const { userID } = res.locals;
  const { id } = params;
  const body: AdminUpdateUserRequest = req.body;

  const user: UserEntity | undefined = await UserRepository.findById(id);

  if (!user) {
    throw throwError(404, 'User not found');
  }

  if (id === userID) {
    throw throwError(409, 'Cannot update self');
  }

  const data: any = {
    isEnabled: body.isEnabled,
    emailsAllowed: body.emailsAllowed,
  };

  if (user.role !== ROLE.ADMIN) {
    if (body.role) {
      data.role = body.role;
    }
  }

  await UserRepository.getRepository().update(user.id, data);

  return createCommonResponse('User updated');
};
