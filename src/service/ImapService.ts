import * as ImapFlowLib from 'imapflow';
import { CryptoAes } from '../utils/CryptoAes';
import { EmailEventJobData } from '../jobs/queueJobs/processEmailEventJob';
import {
  ImapConfig,
  ImapData,
  UserEmailConfigDecryptedData,
} from 'bloben-interface';
import { LOG_TAG } from '../utils/enums';
import { QueueClient } from './init';
import {
  UserEmailConfigRaw,
  getTextCalendarAttachment,
} from '../jobs/cronJobs/getImapEmails';
import { filter } from 'lodash';
import Logger from '../utils/logger';
import UserEmailConfigEntity from '../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../data/repository/UserEmailConfigRepository';
import mailparser from 'mailparser';

const getToAddress = (data: any): string => {
  if (!data.to || (data.to && !data.to.value)) {
    const toHeaderValue: any = data.headerLines.filter((item: any) => {
      return item.key === 'delivered-to';
    });

    const rawValue: string = toHeaderValue[0].line;

    return rawValue.slice('Delivered-To: '.length);
  } else {
    return data.to.value[0].address;
  }
};

const getFromAddress = (data: any): string => {
  if (!data.from || (data.from && !data.from.value)) {
    const toHeaderValue: any = data.headerLines.filter((item: any) => {
      return item.key === 'return-path';
    });

    const rawValue: string = toHeaderValue[0].line;

    return rawValue.slice('Return-Path: <'.length, -1);
  } else {
    return data.from.value[0].address;
  }
};

const checkIfIsCalendarInvite = (data: any): boolean => {
  const { attachments } = data;

  for (const attachment of attachments) {
    if (attachment.contentType === 'text/calendar') {
      return true;
    }
  }

  return false;
};

interface GetImapEmailResult {
  lastSeq: number;
}

interface DecryptedConfigResult {
  userID: string;
  lastSeq: number;
  imap: any;
}

class ImapService {
  public static async validateImapAccountData(
    body: ImapConfig
  ): Promise<boolean> {
    try {
      const { host, auth, port, secure } = body;

      const client = new ImapFlowLib.ImapFlow({
        host,
        port: Number(port),
        secure: secure || Number(port) === 993,
        auth,
      });

      await client.connect();

      await client.logout();

      return true;
    } catch (error) {
      Logger.error('Imap connection failed', error, [LOG_TAG.EMAIL]);
      return false;
    }
  }

  public static async getDecryptedConfig(
    userEmailConfig: UserEmailConfigEntity | UserEmailConfigRaw
  ): Promise<DecryptedConfigResult | null> {
    if (!userEmailConfig?.data) {
      throw Error('Missing email config data');
    }

    const userEmailConfigData: UserEmailConfigDecryptedData =
      await CryptoAes.decrypt(userEmailConfig.data);

    if (!userEmailConfigData) {
      throw Error('Missing decrypted email config data');
    }

    if (userEmailConfigData.imap) {
      return {
        userID: userEmailConfig.userID,
        lastSeq: userEmailConfig.lastSeq,
        imap: userEmailConfigData.imap,
      };
    }

    return null;
  }

  public static async syncEmails(
    id: string,
    decryptedConfig: DecryptedConfigResult
  ) {
    if (!decryptedConfig) {
      throw Error('Missing imap config');
    }

    const getEmailsResult = await this.getEmails(
      decryptedConfig.imap,
      decryptedConfig.userID,
      decryptedConfig.lastSeq
    );

    await UserEmailConfigRepository.getRepository().update(id, {
      lastSeq: getEmailsResult?.lastSeq || decryptedConfig.lastSeq,
      lastSyncAt: new Date(),
    });
  }

  public static async getEmails(
    crendentials: ImapData,
    userID: string,
    lastSeq?: number
  ): Promise<GetImapEmailResult> {
    let client;
    let lock;

    const result: GetImapEmailResult = { lastSeq: null };
    try {
      client = new ImapFlowLib.ImapFlow({
        host: crendentials.imapHost,
        port: crendentials.imapPort,
        auth: {
          user: crendentials.imapUsername,
          pass: crendentials.imapPassword,
        },
      });

      await client.connect();
      lock = await client.getMailboxLock('INBOX');

      try {
        let idsToCheck = [];

        // Get only last message on init
        if (!lastSeq) {
          const message = await client.fetchOne('*', { source: true });
          idsToCheck.push(message.seq);
        } else {
          // Check if we have any new message
          const message = await client.fetchOne('*', { source: true });

          if (message.seq === lastSeq) {
            return;
          }

          // handle changes to sequence to prevent error:
          // Error in IMAP command FETCH: Invalid messageset
          // when emails are deleted
          const sequenceNew = message.seq < lastSeq ? message.seq : lastSeq;

          Logger.info(
            `Sequence for imap sync changed from ${lastSeq} to ${message.seq} for config userID ${userID}`,
            [LOG_TAG.CRON, LOG_TAG.EMAIL]
          );

          const fetchedMsg = await client.fetch(`${sequenceNew}:*`, {
            envelope: true,
          });

          for await (const msg of fetchedMsg) {
            idsToCheck.push(msg.seq);
          }
        }

        // filter prev id to prevent duplicate call
        idsToCheck = filter(idsToCheck, (id) => id !== lastSeq);

        // Download content
        for (let i = 0; i < idsToCheck.length; i++) {
          const id: number = idsToCheck[i];

          if (i + 1 === idsToCheck.length) {
            result.lastSeq = id;
          }
          const email = await client.download(id);
          const data: any = await mailparser.simpleParser(email.content);

          const fromAddress = getFromAddress(data);
          const toAddress = getToAddress(data);

          const isCalendarEvent: boolean = checkIfIsCalendarInvite(data);

          if (isCalendarEvent) {
            const textCalendarString: string = getTextCalendarAttachment(data);

            await QueueClient.processEmails({
              userID,
              icalString: textCalendarString,
              from: fromAddress,
              to: toAddress,
            } as EmailEventJobData);
          }
        }
      } finally {
        lock.release();
      }

      // Close connection
      await client.logout();

      return result;
    } catch (e) {
      Logger.error(`Imap service error`, e, [LOG_TAG.CRON, LOG_TAG.EMAIL]);

      if (lock) {
        lock.release();
      }
      if (client) {
        await client.logout();
      }
    }
  }
}

export default ImapService;
