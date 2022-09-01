import { CommonResponse } from 'bloben-interface';
import { Request, Response } from 'express';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const adminDeleteUser = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { params } = req;
  const { userID } = res.locals;

  const { id } = params;

  const user: UserEntity | undefined = await UserRepository.findById(id);

  if (!user) {
    throw throwError(404, 'User not found');
  }

  if (userID === id) {
    throw throwError(409, 'Cannot delete self');
  }

  await UserRepository.getRepository().delete({
    id,
  });

  return createCommonResponse('User deleted');
};
