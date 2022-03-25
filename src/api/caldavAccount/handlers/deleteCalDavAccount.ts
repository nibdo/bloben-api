import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { createCommonResponse } from '../../../utils/common';
import { io } from '../../../app';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository, {
  CalDavAccount,
} from '../../../data/repository/CalDavAccountRepository';
import RedisService from '../../../service/RedisService';

export const deleteCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const calDavAccount: CalDavAccount | null =
    await CalDavAccountRepository.getByID(id, userID);

  if (!calDavAccount) {
    throw throwError(404, 'Account not found', req);
  }

  await CalDavAccountRepository.getRepository().delete(calDavAccount.id);

  await RedisService.deleteDavClientCache(calDavAccount.id);

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );
  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS })
  );

  return createCommonResponse('CalDav account deleted', {
    id: calDavAccount.id,
  });
};
