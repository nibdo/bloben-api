import { CryptoAes } from '../../utils/CryptoAes';
import { GROUP_LOG_KEY, LOG_TAG } from '../../utils/enums';
import { Job } from 'bullmq';
import { UserEmailConfigData } from '../../bloben-interface/userEmailConfig/userEmailConfig';
import { env } from '../../index';
import { sendEmailInvite } from '../../service/EmailService';
import UserEmailConfigRepository from '../../data/repository/UserEmailConfigRepository';
import UserRepository from '../../data/repository/UserRepository';
import logger, { groupLogs } from '../../utils/logger';

export const sendEmailQueueJob = async (job: Job): Promise<void> => {
  const { data } = job;

  if (!data.userID || !data.email) {
    return;
  }

  try {
    const { userID, email } = data;

    await groupLogs(
      GROUP_LOG_KEY.EMAIL_JOB,
      `send email starts for userID ${userID}`
    );

    const user = await UserRepository.findById(userID);

    // get user or system email config
    const userEmailConfig = await UserEmailConfigRepository.findByUserID(
      userID
    );

    const userEmailConfigData: UserEmailConfigData | null = userEmailConfig
      ? ((await CryptoAes.decrypt(userEmailConfig.data)) as UserEmailConfigData)
      : null;

    const emailConfigData = {
      smtpEmail: userEmailConfigData?.smtp?.smtpEmail || env.email.identity,
      smtpHost: userEmailConfigData?.smtp?.smtpHost || env.email.smtpHost,
      smtpPort: userEmailConfigData?.smtp?.smtpPort || env.email.smtpPort,
      smtpPassword:
        userEmailConfigData?.smtp?.smtpPassword || env.email.password,
      smtpUsername:
        userEmailConfigData?.smtp?.smtpUsername || env.email.username,
    };

    email.from = emailConfigData.smtpEmail;

    if (!userEmailConfigData?.smtp?.smtpPassword && !env.email.password) {
      return;
    }

    logger.info(`Sending email to ${email.recipients.toString()}`, [
      LOG_TAG.QUEUE,
      LOG_TAG.EMAIL,
    ]);
    await sendEmailInvite(email, user, emailConfigData);
  } catch (e) {
    logger.error(`Sending event invite error`, e, [
      LOG_TAG.QUEUE,
      LOG_TAG.EMAIL,
    ]);
  }
};
