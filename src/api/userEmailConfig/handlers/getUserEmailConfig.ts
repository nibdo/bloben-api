import { Request, Response } from 'express';

import { CryptoAes } from '../../../utils/CryptoAes';
import {
  GetUserEmailConfigResponse,
  UserEmailConfigData,
} from '../../../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../../../index';
import { throwError } from '../../../utils/errorCodes';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';

export const getUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<GetUserEmailConfigResponse> => {
  const { userID } = res.locals;

  if (!env.encryptionPassword) {
    throw throwError(409, 'Missing database password', req);
  }

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig && !env.email) {
    throw throwError(404, 'No email config', req);
  }

  const userEmailConfigData: UserEmailConfigData | null = userEmailConfig
    ? ((await CryptoAes.decrypt(userEmailConfig.data)) as UserEmailConfigData)
    : null;

  const HIDDEN_RESPONSE = '*****';

  return {
    smtpEmail: userEmailConfigData?.smtpEmail || env.email.identity,
    smtpHost: userEmailConfigData?.smtpHost || 'SERVER CONFIG',
    smtpPassword: HIDDEN_RESPONSE,
    smtpPort: userEmailConfigData?.smtpPort || env.email.smtpPort,
    smtpUsername: userEmailConfigData?.smtpUsername || HIDDEN_RESPONSE,
    isSystemConfig: userEmailConfigData === null,
  };
};
