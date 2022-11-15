import { Request, Response } from 'express';

import { CryptoAes } from '../../../../utils/CryptoAes';
import {
  GetUserEmailConfigResponse,
  UserEmailConfigData,
} from 'bloben-interface';
import { env } from '../../../../index';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const getUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<GetUserEmailConfigResponse> => {
  const { userID } = res.locals;

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  let userEmailConfigData: UserEmailConfigData | null;
  let mailto: string | null = null;

  if (userEmailConfig) {
    userEmailConfigData =
      userEmailConfig && userEmailConfig.data
        ? ((await CryptoAes.decrypt(
            userEmailConfig.data
          )) as UserEmailConfigData)
        : null;

    if (userEmailConfigData) {
      mailto = userEmailConfigData?.smtp?.smtpEmail;
    }
  }

  return {
    hasSystemConfig: env.email !== null,
    hasCustomConfig: userEmailConfig !== null && userEmailConfig !== undefined,
    mailto: mailto || env.email?.identity || null,
    smtp: userEmailConfigData?.smtp
      ? {
          smtpPort: userEmailConfigData.smtp.smtpPort,
          smtpHost: userEmailConfigData.smtp.smtpHost,
          smtpUsername: userEmailConfigData.smtp.smtpUsername,
          smtpPassword: '******',
          smtpEmail: userEmailConfigData.smtp.smtpEmail,
        }
      : null,
    imap: userEmailConfigData?.imap
      ? {
          imapPort: userEmailConfigData.imap.imapPort,
          imapHost: userEmailConfigData.imap.imapHost,
          imapUsername: userEmailConfigData.imap.imapUsername,
          imapPassword: '******',
        }
      : null,
    calendarForImportID: userEmailConfig?.calendarForImportID,
  };
};
