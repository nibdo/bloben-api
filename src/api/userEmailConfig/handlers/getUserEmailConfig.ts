import { Request, Response } from 'express';

import { CryptoAes } from '../../../utils/CryptoAes';
import {
  GetUserEmailConfigResponse,
  UserEmailConfigData,
} from '../../../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../../../index';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';

export const getUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<GetUserEmailConfigResponse> => {
  const { userID } = res.locals;

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  let mailto: string | null = null;

  if (userEmailConfig) {
    const userEmailConfigData: UserEmailConfigData | null = userEmailConfig
      ? ((await CryptoAes.decrypt(userEmailConfig.data)) as UserEmailConfigData)
      : null;

    if (userEmailConfigData) {
      mailto = userEmailConfigData.smtpEmail;
    }
  }

  return {
    hasSystemConfig: env.email !== null,
    hasCustomConfig: userEmailConfig !== null && userEmailConfig !== undefined,
    mailto: mailto || env.email.identity || null,
  };
};
