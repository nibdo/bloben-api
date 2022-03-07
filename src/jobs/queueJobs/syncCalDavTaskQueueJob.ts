import { Job } from 'bullmq';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { groupBy } from 'lodash';
import { io } from '../../app';
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
    const wasChanged = await syncCalDavTasks(userID, items);

    if (wasChanged) {
      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASKS })
      );
    }
  }
};
