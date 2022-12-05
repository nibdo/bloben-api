import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import imapService from '../../../../service/ImapService';

export const syncEmails = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig || !userEmailConfig?.data) {
    throw throwError(409, 'Email config not found');
  }

  const userEmailConfigData = await imapService.getDecryptedConfig(
    userEmailConfig
  );

  await imapService.syncEmails(userEmailConfigData);

  return createCommonResponse('Emails will sync');
};
