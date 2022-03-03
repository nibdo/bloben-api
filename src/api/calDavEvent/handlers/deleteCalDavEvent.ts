import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { DeleteCalDavEventRequest } from '../../../bloben-interface/event/event';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { createCommonResponse } from '../../../utils/common';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';

export const deleteCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError('404', 'Not found');
  }

  const client = await loginToCalDav(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

  await client.deleteCalendarObject({
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  // delete cache
  // await CalDavCacheService.deleteByUserID(userID);

  // trigger resync for cached events
  // await CalDavCacheService.syncEventsForAccount(calDavAccount);

  return createCommonResponse('Event deleted');
};
