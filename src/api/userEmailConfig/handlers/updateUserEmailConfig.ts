import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { CryptoAes } from '../../../utils/CryptoAes';
import { LOG_TAG } from '../../../utils/enums';
import { UpdateUserEmailConfigRequest } from '../../../bloben-interface/userEmailConfig/userEmailConfig';
import { createCommonResponse } from '../../../utils/common';
import { createTransport } from 'nodemailer';
import { env } from '../../../index';
import { getSmtpCredentials } from '../../../service/EmailService';
import { throwError } from '../../../utils/errorCodes';
import UserEmailConfigEntity from '../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';
import logger from '../../../utils/logger';

export const updateUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: UpdateUserEmailConfigRequest = req.body;
  const { user } = res.locals;

  if (!env.encryptionPassword) {
    throw throwError(409, 'Missing database password', req);
  }

  const data = await CryptoAes.encrypt({
    smtpPort: body.smtpPort,
    smtpHost: body.smtpHost,
    smtpEmail: body.smtpEmail,
    smtpUsername: body.smtpUsername,
    smtpPassword: body.smtpPassword,
  });

  // validate config
  try {
    const nodemailerTransport = createTransport(
      getSmtpCredentials({
        smtpPort: body.smtpPort,
        smtpHost: body.smtpHost,
        smtpEmail: body.smtpEmail,
        smtpUsername: body.smtpUsername,
        smtpPassword: body.smtpPassword,
      })
    );
    const isValid = await nodemailerTransport.verify();

    nodemailerTransport.close();

    if (!isValid) {
      throw throwError(409, 'Cannot connect to email server', req);
    }
  } catch (e: any) {
    logger.error('Cannot connect to email server', e, [
      LOG_TAG.EMAIL,
      LOG_TAG.REST,
    ]);
    throw throwError(409, 'Cannot connect to email server', req);
  }

  let userEmailConfig = await UserEmailConfigRepository.findByUserID(user.id);

  if (!userEmailConfig) {
    userEmailConfig = new UserEmailConfigEntity(user.id, data);

    await UserEmailConfigRepository.getRepository().save(userEmailConfig);
  } else {
    userEmailConfig.data = data;
    await UserEmailConfigRepository.getRepository().update(
      {
        user,
      },
      {
        data,
      }
    );
  }

  return createCommonResponse('User email config updated');
};
