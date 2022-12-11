import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import imapService from '../../../../service/ImapService';

export const syncEmails = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const userEmailConfigs = await UserEmailConfigRepository.findByUserID(userID);

  for (const userEmailConfig of userEmailConfigs) {
    const userEmailConfigData = await imapService.getDecryptedConfig(
      userEmailConfig
    );

    await imapService.syncEmails(userEmailConfigData);
  }

  return createCommonResponse('Emails will sync');
};
