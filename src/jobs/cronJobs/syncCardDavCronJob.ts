import { BULL_QUEUE, GROUP_LOG_KEY } from '../../utils/enums';
import { cardDavBullQueue } from '../../service/BullQueue';
import { groupLogs } from '../../utils/logger';
import UserRepository from '../../data/repository/UserRepository';

export const syncCardDavCronJob = async (): Promise<void> => {
  await groupLogs(GROUP_LOG_KEY.CARDDAV_JOB, 'syncCardDavCronJob start');

  // get users for sync
  const users = await UserRepository.getRepository().find({
    select: ['id'],
  });

  // schedule sync job for each user
  for (const user of users) {
    await cardDavBullQueue.add(BULL_QUEUE.CARDDAV_SYNC, { userID: user.id });
  }
};
