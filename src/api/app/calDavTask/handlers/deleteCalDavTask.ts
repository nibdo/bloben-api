import { Request, Response } from 'express';

import { CommonResponse, DeleteCalDavEventRequest } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';
import { loginToCalDav } from '../../../../service/davService';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavTaskRepository from '../../../../data/repository/CalDavTaskRepository';

export const deleteCalDavTask = async (
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
    throw throwError(404, 'Not found');
  }

  const client = await loginToCalDav(calDavAccount);

  await client.deleteCalendarObject({
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  await CalDavTaskRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASKS })
  );

  return createCommonResponse('Task deleted');
};
