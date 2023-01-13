import { GROUP_LOG_KEY } from '../../utils/enums';
import { QueueClient, socketService } from '../../service/init';
import { getUserIDFromWsRoom } from '../../utils/common';
import { groupLogs } from '../../utils/logger';

/**
 * Get users connected with ws for more frequent sync
 */
export const syncCardDavCronJobConnectedUsers = async (): Promise<void> => {
  await groupLogs(
    GROUP_LOG_KEY.CARDDAV_JOB,
    'syncCardDavCronJobConnectedUsers start'
  );

  const socketClients = socketService.io?.sockets?.adapter?.rooms;

  const activeUserIDs: string[] = [];

  socketClients.forEach((_set, room) => {
    const userID = getUserIDFromWsRoom(room);

    activeUserIDs.push(userID);
  });

  // schedule sync job for each user
  for (const userID of activeUserIDs) {
    await QueueClient.syncCardDav(userID);
  }
};
