import { GROUP_LOG_KEY, LOG_TAG, REDIS_PREFIX } from '../../utils/enums';
import { ImapData } from 'bloben-interface';
import { redisClient } from '../../index';
import UserEmailConfigRepository from '../../data/repository/UserEmailConfigRepository';
import imapService from '../../service/ImapService';
import logger, { groupLogs } from '../../utils/logger';

export interface UserEmailConfigRaw {
  data: string;
  lastSeq: number | null;
  userID: string;
}

interface UserEmailConfigDecrypted {
  lastSeq: number | null;
  userID: string;
  imap: ImapData;
}

export const getTextCalendarAttachment = (data: any): string => {
  const { attachments } = data;

  for (const attachment of attachments) {
    if (attachment.contentType === 'text/calendar') {
      return attachment.content.toString();
    }
  }

  return '';
};

export const getImapEmails = async (): Promise<void> => {
  try {
    const userEmailConfigs: UserEmailConfigRaw[] =
      await UserEmailConfigRepository.getRepository().query(`
      SELECT 
        ec.data as data,
        ec.last_seq as "lastSeq",
        ec.user_id as "userID"
      FROM user_email_config ec
      WHERE
        ec.has_imap IS TRUE
        AND ec.data IS NOT NULL
    `);

    const decryptedConfigs: UserEmailConfigDecrypted[] = [];

    for (const userEmailConfig of userEmailConfigs) {
      const wasActive = await redisClient.get(
        `${REDIS_PREFIX.WAS_ACTIVE}_${userEmailConfig.userID}`
      );

      if (wasActive && userEmailConfig.data) {
        try {
          await groupLogs(
            GROUP_LOG_KEY.IMAP_SYNC_JOB,
            `getImapEmails #userID ${userEmailConfig.userID} with sequence: ${userEmailConfig.lastSeq}`
          );

          const userEmailConfigData = await imapService.getDecryptedConfig(
            userEmailConfig
          );
          decryptedConfigs.push(userEmailConfigData);
        } catch (e) {
          logger.error(
            `Error decrypting email config data for userID ${userEmailConfig.userID}`,
            e,
            [LOG_TAG.CRON, LOG_TAG.EMAIL]
          );
        }
      }
    }

    for (const decryptedConfig of decryptedConfigs) {
      await imapService.syncEmails(decryptedConfig);
    }
  } catch (e) {
    logger.error(`Error getImapEmails job`, e, [LOG_TAG.CRON, LOG_TAG.EMAIL]);
  }
};
