import { CommonResponse } from 'bloben-interface';
import { Request, Response } from 'express';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';

import { QueueClient, socketService } from '../../../../service/init';
import { createCommonResponse } from '../../../../utils/common';

export const getSync = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.SYNCING, value: false }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );

  await QueueClient.syncCalDav(userID);
  await QueueClient.syncCardDav(userID);
  await QueueClient.syncWebcal(userID);

  return createCommonResponse('Sync success');
};
