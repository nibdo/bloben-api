import { GROUP_LOG_KEY } from '../../utils/enums';
import { Job } from 'bullmq';
import { groupBy } from 'lodash';
import { groupLogs } from '../../utils/logger';
import { syncCalDavTasks } from '../../utils/davHelperTodo';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';

export const syncCalDavTaskQueueJob = async (job: Job) => {
  const { data } = job;

  if (!data.userID) {
    return;
  }

  await groupLogs(
    GROUP_LOG_KEY.CALDAV_TASK_JOB,
    `syncCalDavTaskQueueJob starts for userID ${data.userID}`
  );

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
