import { LOG_TAG } from '../../utils/enums';
import ServerSettingsRepository from '../../data/repository/ServerSettingsRepository';
import logger from '../../utils/logger';

export const resetEmailDailyLimit = async (): Promise<void> => {
  const serverSettings =
    await ServerSettingsRepository.getRepository().findOne();
  logger.info(
    `Resetting email daily limit after ${serverSettings.innerEmailCounter} emails sent`,
    [LOG_TAG.CRON, LOG_TAG.EMAIL]
  );

  await ServerSettingsRepository.getRepository().update(serverSettings.id, {
    innerEmailCounter: 0,
  });
};
