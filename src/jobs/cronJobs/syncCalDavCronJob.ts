import { BULL_QUEUE, LOG_TAG } from '../../utils/enums';
import { calDavSyncBullQueue } from '../../service/BullQueue';
import UserRepository from '../../data/repository/UserRepository';
import logger from '../../utils/logger';

export const syncCalDavCronJob = async (): Promise<void> => {
  logger.info('syncCalDavCronJob start', [LOG_TAG.CRON, LOG_TAG.CALDAV]);

  // get users for sync
  const users = await UserRepository.getRepository().find({
    select: ['id'],
  });

  // schedule sync job for each user
  for (const user of users) {
    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID: user.id });
  }
};
