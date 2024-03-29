import { Request, Response } from 'express';

import {
  CommonResponse,
  UpdateUserEmailConfigRequest,
  UserEmailConfigData,
} from 'bloben-interface';
import { CryptoAes } from '../../../../utils/CryptoAes';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { env } from '../../../../index';
import { throwError } from '../../../../utils/errorCodes';
import {
  validateImapCredentials,
  validateSmtpCredentials,
} from './createUserEmailConfig';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import logger from '../../../../utils/logger';

const checkConfigWasChanged = (
  config: UserEmailConfigData,
  body: UpdateUserEmailConfigRequest
) => {
  const { imap, smtp } = body;
  if (body.imap) {
    if (!config || !config.imap) {
      return true;
    }

    if (
      imap.imapHost !== config.imap.imapHost ||
      (imap.imapPassword && imap.imapPassword !== config.imap.imapPassword) ||
      imap.imapPort !== config.imap.imapPort ||
      imap.imapUsername !== config.imap.imapUsername
    ) {
      return true;
    }
  }

  if (body.smtp) {
    if (!config || !config.smtp) {
      return true;
    }

    if (
      smtp.smtpHost !== config.smtp.smtpHost ||
      (smtp.smtpPassword && smtp.smtpPassword !== config.smtp.smtpPassword) ||
      smtp.smtpPort !== config.smtp.smtpPort ||
      smtp.smtpUsername !== config.smtp.smtpUsername
    ) {
      return true;
    }
  }

  return false;
};

export const updateUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: UpdateUserEmailConfigRequest = req.body;
  const { userID } = res.locals;
  const { id } = req.params;

  if (!env.encryptionPassword) {
    throw throwError(409, 'Missing database password', req);
  }

  const config = await UserEmailConfigRepository.findByUserIDAndID(userID, id);

  if (!config) {
    throw throwError(404, 'Email config not found');
  }

  const configData = (await CryptoAes.decrypt(
    config.data
  )) as UserEmailConfigData;

  const configWasChanged = checkConfigWasChanged(config, body);

  // validate config
  try {
    if (configWasChanged) {
      if (!body.smtp?.smtpPassword) {
        body.smtp.smtpPassword = configData.smtp.smtpPassword;
      }

      await validateSmtpCredentials(body);

      if (!body.imap?.imapPassword) {
        body.imap.imapPassword = configData.imap.imapPassword;
      }

      await validateImapCredentials(body);
    }
  } catch (e: any) {
    logger.error('Cannot connect to email server', e, [
      LOG_TAG.EMAIL,
      LOG_TAG.REST,
    ]);
    throw throwError(409, 'Cannot connect to email server', req);
  }

  const dataToUpdate: any = {
    hasImap: !!body.imap,
    imapSyncingInterval: body.imapSyncingInterval || 15,
    aliases: body.aliases,
    defaultAlias: body.defaultAlias,
    calendarForImportID: body.calendarForImportID,
  };

  if (configWasChanged) {
    dataToUpdate.data = await CryptoAes.encrypt({
      smtp: body.smtp ? body.smtp : null,
      imap: body.imap ? body.imap : null,
    });
  }

  if (body.imap) {
    dataToUpdate.hasImap = true;
  }

  await UserEmailConfigRepository.getRepository().update(
    {
      userID,
      id,
    },
    dataToUpdate
  );

  return createCommonResponse('User email config updated');
};
