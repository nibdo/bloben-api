import { v4 } from 'uuid';
import nodemailer from 'nodemailer';

import { EmailCredentials, EmailData } from '../common/interface/common';
import { EmailInviteData } from '../bloben-interface/event/event';
import { NODE_ENV } from '../utils/enums';
import { UserEmailConfigData } from '../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../index';

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
  configData?: UserEmailConfigData
) => {
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

export const sendEmail = async (emailData: EmailData) => {
  return new Promise((resolve: any, reject: any) => {
    const nodemailerTransport: any = createTransport(getSmtpCredentials());

    // Send email
    nodemailerTransport.sendMail(
      { ...emailData, from: emailData.from, to: emailData.recipient },
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
