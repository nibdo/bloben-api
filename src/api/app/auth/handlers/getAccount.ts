import { Request, Response } from 'express';

import { GetAccountResponse } from '../../../../bloben-interface/user/user';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const getAccount = async (
  req: Request,
  res: Response
): Promise<GetAccountResponse> => {
  const { userID } = res.locals;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  return user.getAccount();
};
