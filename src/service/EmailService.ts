import { v4 } from 'uuid';
import nodemailer from 'nodemailer';

import { EmailCredentials } from '../common/interface/common';
import { EmailInviteData } from '../bloben-interface/event/event';
import { LOG_TAG, NODE_ENV } from '../utils/enums';
import { UserEmailConfigData } from '../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../index';
import { throwError } from '../utils/errorCodes';
import ServerSettingsRepository from '../data/repository/ServerSettingsRepository';
import UserEntity from '../data/entity/UserEntity';
import logger from '../utils/logger';

const createMessageID = () => `${v4()}@bloben`;

export const getSmtpCredentials = (
  data?: UserEmailConfigData
): EmailCredentials => ({
  port: data ? data.smtpPort : env.email.smtpPort,
  host: data ? data.smtpHost : env.email.smtpHost,
  auth: {
    user: data ? data.smtpUsername : env.email.username,
    pass: data ? data.smtpPassword : env.email.password,
  },
  secure: false,
});

export const sendEmailInvite = async (
  emailInvite: EmailInviteData,
  user: UserEntity,
  configData?: UserEmailConfigData
) => {
  if (!user.emailsAllowed) {
    throw throwError(409, 'User cannot send email');
  }

  if (emailInvite.recipients.length > 200) {
    throw throwError(409, 'Too many recipients in email');
  }

  const serverSettings =
    await ServerSettingsRepository.getRepository().findOne();

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
      icalEvent: {
        filename: 'invite.ics',
        method: emailInvite.method,
        content: emailInvite.ical,
      },
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
        from: configData.smtpEmail,
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
