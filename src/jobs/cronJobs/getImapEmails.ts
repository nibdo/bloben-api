import { GROUP_LOG_KEY, LOG_TAG, REDIS_PREFIX } from '../../utils/enums';
import { MemoryClient } from '../../service/init';
import UserEmailConfigRepository from '../../data/repository/UserEmailConfigRepository';
import imapService from '../../service/ImapService';
import logger, { groupLogs } from '../../utils/logger';

export interface UserEmailConfigRaw {
  id: string;
  data: string;
  lastSeq: number | null;
  userID: string;
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
        ec.id as id,
        ec.data as data,
        ec.last_seq as "lastSeq",
        ec.user_id as "userID"
      FROM user_email_config ec
      WHERE
        ec.has_imap IS TRUE
        AND ec.data IS NOT NULL
    `);

    for (const userEmailConfig of userEmailConfigs) {
      const wasActive = await MemoryClient.get(
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

          await imapService.syncEmails(userEmailConfig.id, userEmailConfigData);
        } catch (e) {
          logger.error(
            `Error decrypting email config data for userID ${userEmailConfig.userID}`,
            e,
            [LOG_TAG.CRON, LOG_TAG.EMAIL]
          );
        }
      }
    }
  } catch (e) {
    logger.error(`Error getImapEmails job`, e, [LOG_TAG.CRON, LOG_TAG.EMAIL]);
  }
};
