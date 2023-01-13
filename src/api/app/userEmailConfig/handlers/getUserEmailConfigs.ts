import { Request, Response } from 'express';

import { CryptoAes } from '../../../../utils/CryptoAes';
import {
  EmailConfigData,
  GetUserEmailConfigResponse,
  UserEmailConfigData,
} from 'bloben-interface';
import { env } from '../../../../index';
import { parseToJSON } from '../../../../utils/common';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const getUserEmailConfigs = async (
  req: Request,
  res: Response
): Promise<GetUserEmailConfigResponse> => {
  const { userID } = res.locals;

  const userEmailConfigs = await UserEmailConfigRepository.findByUserID(userID);

  const emailConfigData: EmailConfigData[] = [];

  if (userEmailConfigs.length) {
    for (const userEmailConfig of userEmailConfigs) {
      const userEmailConfigData: UserEmailConfigData | null =
        userEmailConfig && userEmailConfig.data
          ? ((await CryptoAes.decrypt(
              userEmailConfig.data
            )) as UserEmailConfigData)
          : null;

      emailConfigData.push({
        id: userEmailConfig.id,
        smtp: userEmailConfigData?.smtp
          ? {
              smtpPort: userEmailConfigData.smtp.smtpPort,
              smtpHost: userEmailConfigData.smtp.smtpHost,
              smtpUsername: userEmailConfigData.smtp.smtpUsername,
              smtpPassword: '',
            }
          : null,
        imap: userEmailConfigData?.imap
          ? {
              imapPort: userEmailConfigData.imap.imapPort,
              imapHost: userEmailConfigData.imap.imapHost,
              imapUsername: userEmailConfigData.imap.imapUsername,
              imapPassword: '',
            }
          : null,
        calendarForImportID: userEmailConfig?.calendarForImportID,
        aliases: parseToJSON(userEmailConfig.aliases),
        defaultAlias: userEmailConfig.defaultAlias,
        isDefault: userEmailConfig.isDefault,
      });
    }
  }

  return {
    hasSystemConfig: env.email !== null,
    hasCustomConfig: !!emailConfigData.length,
    configs: emailConfigData,
  };
};
