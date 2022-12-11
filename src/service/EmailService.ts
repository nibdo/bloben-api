import { v4 } from 'uuid';
import nodemailer from 'nodemailer';

import { EmailCredentials } from '../common/interface/common';
import {
  EmailInviteData,
  ImapConfig,
  ImapData,
  SmtpData,
} from 'bloben-interface';
import { LOG_TAG, NODE_ENV } from '../utils/enums';
import { env } from '../index';
import { throwError } from '../utils/errorCodes';
import ServerSettingsRepository from '../data/repository/ServerSettingsRepository';
import UserEntity from '../data/entity/UserEntity';
import logger from '../utils/logger';

const createMessageID = () => `${v4()}@bloben`;

export const getSmtpCredentials = (data?: SmtpData): EmailCredentials => ({
  port: data ? data.smtpPort : env.email.smtpPort,
  host: data ? data.smtpHost : env.email.smtpHost,
  auth: {
    user: data ? data.smtpUsername : env.email.username,
    pass: data ? data.smtpPassword : env.email.password,
  },
  secure: false,
});

export const getImapCredentials = (data?: ImapData): ImapConfig => ({
  port: data.imapPort,
  host: data.imapHost,
  auth: {
    user: data.imapUsername,
    pass: data.imapPassword,
  },
  secure: false,
});

export const sendEmailInvite = async (
  emailInvite: EmailInviteData,
  user: UserEntity,
  configData?: SmtpData
) => {
  if (!user.emailsAllowed) {
    throw throwError(409, 'User cannot send email');
  }

  if (emailInvite.recipients.length > 200) {
    throw throwError(409, 'Too many recipients in email');
  }

  const serverSettingsAll =
    await ServerSettingsRepository.getRepository().find();
  const serverSettings = serverSettingsAll?.[0];

  await ServerSettingsRepository.getRepository().update(serverSettings.id, {
    innerEmailCounter: serverSettings.innerEmailCounter + 1,
  });

  if (
    !serverSettings ||
    serverSettings.innerEmailCounter >= serverSettings.emailCounter
  ) {
    logger.info(
      `Cannot send email - reached daily email limit with ${serverSettings.innerEmailCounter} emails sent`,
      [LOG_TAG.REST, LOG_TAG.EMAIL]
    );

    throw throwError(409, 'Cannot send email - reached daily email limit');
  }

  return new Promise((resolve: any, reject: any) => {
    const emailPrepared: any = {
      messageId: createMessageID(),
      from: emailInvite.from,
      to: emailInvite.recipients,
      subject: emailInvite.subject,
      text: emailInvite.body,
      method: emailInvite.method,
      icalEvent: emailInvite?.ical
        ? {
            filename: 'invite.ics',
            method: emailInvite.method,
            content: emailInvite.ical,
          }
        : undefined,
    };

    // handle test cases
    if (env.nodeEnv === NODE_ENV.TEST) {
      if (env.email.password === 'fail') {
        throw Error('Should fail test');
      }

      resolve('done');
    }

    const nodemailerTransport: any = createTransport(
      getSmtpCredentials(configData)
    );

    // Send email
    nodemailerTransport.sendMail(
      {
        ...emailPrepared,
        from: emailInvite.from,
        to: emailInvite.recipients,
      },
      (error: any, info: any): void => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      }
    );
  });
};

const createTransport = (credentials: EmailCredentials) => {
  return nodemailer.createTransport(credentials);
};
