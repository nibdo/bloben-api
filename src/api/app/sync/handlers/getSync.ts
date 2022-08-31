import {
  BULL_QUEUE,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { CommonResponse } from '../../../../bloben-interface/interface';
import { Request, Response } from 'express';
import {
  calDavSyncBullQueue,
  cardDavBullQueue,
  webcalSyncBullQueue,
} from '../../../../service/BullQueue';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';

export const getSync = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.SYNCING, value: false })
  );

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });
  await webcalSyncBullQueue.add(BULL_QUEUE.WEBCAL_SYNC, { userID });
  await cardDavBullQueue.add(BULL_QUEUE.CARDDAV_SYNC, { userID });

  return createCommonResponse('Sync success');
};
