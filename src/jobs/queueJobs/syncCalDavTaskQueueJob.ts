import { Job } from 'bullmq';
import { LOG_TAG } from '../../utils/enums';
import { groupBy } from 'lodash';
import { syncCalDavTasks } from '../../utils/davHelperTodo';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';
import logger from '../../utils/logger';

export const syncCalDavTaskQueueJob = async (job: Job) => {
  const { data } = job;

  if (!data.userID) {
    return;
  }
  logger.info(`Syncing caldav tasks for userID ${data.userID}`, [
    LOG_TAG.QUEUE,
    LOG_TAG.CALDAV_TASK,
  ]);

  // get calDav accounts
  const calDavAccounts: any =
    await CalDavAccountRepository.getCalDavAccountsForSync(data.userID);

  // group by userID
  const groupedByUserID: any = groupBy(calDavAccounts, 'userID');

  for (const [userID, items] of Object.entries(groupedByUserID)) {
    // sync items
    await syncCalDavTasks(userID, items);
  }
};
