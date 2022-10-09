import { BULL_QUEUE } from '../../utils/enums';
import { calDavTaskSyncBullQueue } from '../../service/BullQueue';
import { getUserIDFromWsRoom } from '../../utils/common';
import { io } from '../../app';

/**
 * Get users connected with ws for more frequent sync
 */
export const syncCalDavTaskCronJobConnectedUsers = async (): Promise<void> => {
  const socketClients = io.sockets.adapter.rooms;

  const activeUserIDs: string[] = [];

  socketClients.forEach((_set, room) => {
    const userID = getUserIDFromWsRoom(room);

    activeUserIDs.push(userID);
  });

  // schedule sync job for each user
  for (const userID of activeUserIDs) {
    await calDavTaskSyncBullQueue.add(BULL_QUEUE.CALDAV_TASK_SYNC, {
      userID: userID,
    });
  }
};
