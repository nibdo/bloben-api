import { Request, Response } from 'express';

import { CommonResponse } from '../../../../bloben-interface/interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const deleteUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(user.id);

  if (!userEmailConfig) {
    throw throwError(404, 'User email config not found', req);
  }

  await UserEmailConfigRepository.getRepository().delete({
    user,
  });

  return createCommonResponse('User email config deleted');
};
