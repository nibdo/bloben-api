import { BULL_QUEUE, LOG_TAG } from '../../utils/enums';
import { calDavSyncBullQueue } from '../../service/BullQueue';
import { getUserIDFromWsRoom } from '../../utils/common';
import { io } from '../../app';
import logger from '../../utils/logger';

/**
 * Get users connected with ws for more frequent sync
 */
export const syncCalDavCronJobConnectedUsers = async (): Promise<void> => {
  logger.info('syncCalDavCronJobConnectedUsers start', [
    LOG_TAG.CRON,
    LOG_TAG.CALDAV,
  ]);

  const socketClients = io.sockets.adapter.rooms;

  const activeUserIDs: string[] = [];

  socketClients.forEach((_set, room) => {
    const userID = getUserIDFromWsRoom(room);

    activeUserIDs.push(userID);
  });

  // schedule sync job for each user
  for (const userID of activeUserIDs) {
    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID: userID });
  }
};
