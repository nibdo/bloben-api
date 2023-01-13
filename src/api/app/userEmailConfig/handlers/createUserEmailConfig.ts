import { Request, Response } from 'express';

import {
  CommonResponse,
  CreateUserEmailConfigRequest,
  UpdateUserEmailConfigRequest,
} from 'bloben-interface';
import { CryptoAes } from '../../../../utils/CryptoAes';
import { LOG_TAG } from '../../../../utils/enums';
import {
  checkIfHasDefaultEmailConfig,
  createCommonResponse,
} from '../../../../utils/common';
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

export const validateSmtpCredentials = async (
  body: CreateUserEmailConfigRequest | UpdateUserEmailConfigRequest
) => {
  const nodemailerTransport = createTransport(getSmtpCredentials(body.smtp));
  const isValid = await nodemailerTransport.verify();

  nodemailerTransport.close();

  if (!isValid) {
    throw throwError(409, 'Cannot connect to email server SMTP');
  }
};

export const validateImapCredentials = async (
  body: CreateUserEmailConfigRequest | UpdateUserEmailConfigRequest
) => {
  const isValidImap = await ImapService.validateImapAccountData(
    getImapCredentials(body.imap)
  );

  if (!isValidImap) {
    throw throwError(409, 'Cannot connect to email server IMAP');
  }
};

export const createUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: CreateUserEmailConfigRequest = req.body;
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
      await validateSmtpCredentials(body);
    }

    if (body.imap) {
      await validateImapCredentials(body);
    }
  } catch (e: any) {
    logger.error('Cannot connect to email server', e, [
      LOG_TAG.EMAIL,
      LOG_TAG.REST,
    ]);
    throw throwError(409, 'Cannot connect to email server', req);
  }

  const hasDefaultConfig = await checkIfHasDefaultEmailConfig(userID);

  const userEmailConfig = new UserEmailConfigEntity(
    userID,
    data,
    body,
    !!body.imap
  );

  if (!hasDefaultConfig) {
    userEmailConfig.isDefault = true;
  }

  await UserEmailConfigRepository.getRepository().save(userEmailConfig);

  return createCommonResponse('User email config created');
};
