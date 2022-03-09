import { BULL_QUEUE, GROUP_LOG_KEY } from '../../utils/enums';
import { calDavSyncBullQueue } from '../../service/BullQueue';
import { groupLogs } from '../../utils/logger';
import UserRepository from '../../data/repository/UserRepository';

export const syncCalDavCronJob = async (): Promise<void> => {
  await groupLogs(GROUP_LOG_KEY.CALDAV_JOB, 'syncCalDavCronJob start');

  // get users for sync
  const users = await UserRepository.getRepository().find({
    select: ['id'],
  });

  // schedule sync job for each user
  for (const user of users) {
    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID: user.id });
  }
};
