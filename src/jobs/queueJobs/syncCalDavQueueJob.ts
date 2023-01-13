import {
  GROUP_LOG_KEY,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { Job } from 'bullmq';
import { groupBy } from 'lodash';
import { groupLogs } from '../../utils/logger';
import { socketService } from '../../service/init';
import { syncCalDavEvents } from '../../utils/davHelper';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';

export const syncCalDavQueueJob = async (job: Job): Promise<void> => {
  const { data } = job;

  if (!data.userID) {
    return;
  }

  await groupLogs(
    GROUP_LOG_KEY.CALDAV_JOB,
    `syncCalDavQueueJob starts for userID ${data.userID}`
  );

  // get calDav accounts
  const calDavAccounts: any =
    await CalDavAccountRepository.getCalDavAccountsForSync(data.userID);

  // group by userID
  const groupedByUserID: any = groupBy(calDavAccounts, 'userID');

  for (const [userID, items] of Object.entries(groupedByUserID)) {
    // sync items
    const wasChanged = await syncCalDavEvents(userID, items);

    // notify to refetch if data changed
    if (wasChanged) {
      socketService.emit(
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
        SOCKET_CHANNEL.SYNC,
        `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
      );
    }

    socketService.emit(
      JSON.stringify({ type: SOCKET_MSG_TYPE.SYNCING }),
      SOCKET_CHANNEL.SYNC,
      `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
    );
  }
};
