import { Request, Response } from 'express';

import { CommonResponse, DeleteCalDavEventRequest } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  createCommonResponse,
  handleDavResponse,
} from '../../../../utils/common';
import { deleteCalendarObject } from 'tsdav';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { io } from '../../../../app';
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

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const response = await deleteCalendarObject({
    headers: davHeaders,
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  handleDavResponse(response, 'Delete task error');

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
