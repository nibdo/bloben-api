import { BULL_QUEUE, GROUP_LOG_KEY } from '../../utils/enums';
import { cardDavBullQueue } from '../../service/BullQueue';
import { getUserIDFromWsRoom } from '../../utils/common';
import { groupLogs } from '../../utils/logger';
import { io } from '../../app';

/**
 * Get users connected with ws for more frequent sync
 */
export const syncCardDavCronJobConnectedUsers = async (): Promise<void> => {
  await groupLogs(
    GROUP_LOG_KEY.CARDDAV_JOB,
    'syncCardDavCronJobConnectedUsers start'
  );

  const socketClients = io.sockets.adapter.rooms;

  const activeUserIDs: string[] = [];

  socketClients.forEach((_set, room) => {
    const userID = getUserIDFromWsRoom(room);

    activeUserIDs.push(userID);
  });

  // schedule sync job for each user
  for (const userID of activeUserIDs) {
    await cardDavBullQueue.add(BULL_QUEUE.CARDDAV_SYNC, { userID: userID });
  }
};
