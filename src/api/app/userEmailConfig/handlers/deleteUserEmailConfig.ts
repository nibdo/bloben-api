import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const deleteUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const userEmailConfig = await UserEmailConfigRepository.findByUserIDAndID(
    userID,
    id
  );

  if (!userEmailConfig) {
    throw throwError(404, 'User email config not found', req);
  }

  await UserEmailConfigRepository.getRepository().delete({
    id: userEmailConfig.id,
  });

  return createCommonResponse('User email config deleted');
};
