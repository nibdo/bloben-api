import { Request, Response } from 'express';

import { GetUserEmailConfigResponse } from '../../../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../../../index';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';

export const getUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<GetUserEmailConfigResponse> => {
  const { userID } = res.locals;

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  return {
    hasSystemConfig: env.email !== null,
    hasCustomConfig: userEmailConfig !== null && userEmailConfig !== undefined,
  };
};
