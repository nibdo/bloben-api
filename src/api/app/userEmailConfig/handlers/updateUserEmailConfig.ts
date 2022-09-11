import { Request, Response } from 'express';

import { CommonResponse, UpdateUserEmailConfigRequest } from 'bloben-interface';
import { CryptoAes } from '../../../../utils/CryptoAes';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { createTransport } from 'nodemailer';
import { env } from '../../../../index';
import {
  getImapCredentials,
  getSmtpCredentials,
} from '../../../../service/EmailService';
import { throwError } from '../../../../utils/errorCodes';
import ImapService from '../../../../service/ImapService';
import UserEmailConfigEntity from '../../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import logger from '../../../../utils/logger';

export const updateUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: UpdateUserEmailConfigRequest = req.body;
  const { userID } = res.locals;

  if (!env.encryptionPassword) {
    throw throwError(409, 'Missing database password', req);
  }

  const data = await CryptoAes.encrypt({
    smtp: body.smtp ? body.smtp : null,
    imap: body.imap ? body.imap : null,
  });

  // validate config
  try {
    if (body.smtp) {
      const nodemailerTransport = createTransport(
        getSmtpCredentials(body.smtp)
      );
      const isValid = await nodemailerTransport.verify();

      nodemailerTransport.close();

      if (!isValid) {
        throw throwError(409, 'Cannot connect to email server SMTP', req);
      }
    }

    if (body.imap) {
      const isValidImap = ImapService.validateImapAccountData(
        getImapCredentials(body.imap)
      );

      if (!isValidImap) {
        throw throwError(409, 'Cannot connect to email server IMAP', req);
      }
    }
  } catch (e: any) {
    logger.error('Cannot connect to email server', e, [
      LOG_TAG.EMAIL,
      LOG_TAG.REST,
    ]);
    throw throwError(409, 'Cannot connect to email server', req);
  }

  let userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig) {
    userEmailConfig = new UserEmailConfigEntity(
      userID,
      data,
      body.imapSyncingInterval,
      !!body.imap
    );

    await UserEmailConfigRepository.getRepository().save(userEmailConfig);
  } else {
    userEmailConfig.data = data;
    await UserEmailConfigRepository.getRepository().update(
      {
        userID,
      },
      {
        data,
        hasImap: !!body.imap,
        imapSyncingInterval: body.imapSyncingInterval || 15,
      }
    );
  }

  return createCommonResponse('User email config updated');
};
