import { GROUP_LOG_KEY } from '../../utils/enums';
import { QueueClient, socketService } from '../../service/init';
import { getUserIDFromWsRoom } from '../../utils/common';
import { isElectron } from '../../config/env';
import Logger, { groupLogs } from '../../utils/logger';
import UserRepository from '../../data/repository/UserRepository';

/**
 * Get users connected with ws for more frequent sync
 */
export const syncCalDavCronJobConnectedUsers = async (): Promise<void> => {
  if (isElectron) {
    const user = await UserRepository.getRepository().findOne({
      select: ['id'],
    });

    if (user) {
      await QueueClient.syncCalDav(user.id);

      await Logger.info('[SYNC]: CalDAV data');
    }

    return;
  }

  await groupLogs(
    GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
    'syncCalDavCronJobConnectedUsers start'
  );

  const socketClients = socketService.io?.sockets?.adapter?.rooms;

  const activeUserIDs: string[] = [];

  socketClients.forEach((_set, room) => {
    const userID = getUserIDFromWsRoom(room);

    activeUserIDs.push(userID);
  });

  // schedule sync job for each user
  for (const userID of activeUserIDs) {
    await QueueClient.syncCalDav(userID);
  }
};
