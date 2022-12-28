import { Request, Response } from 'express';

import { CommonResponse, UpdateCalDavCalendarRequest } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse, parseJSON } from '../../../../utils/common';
import { socketService } from '../../../../service/init';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';

export const updateCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { id } = req.params;
  const { userID } = res.locals;
  const body: UpdateCalDavCalendarRequest = req.body;

  const calDavCalendar = await CalDavCalendarRepository.getByIDWithAccount(
    id as string,
    userID
  );

  if (!calDavCalendar) {
    throw throwError(404, 'CalDav calendar not found');
  }

  await CalDavCalendarRepository.getRepository().update(
    {
      id,
    },
    {
      customColor: body.color,
      customDisplayName: body.name,
      alarms: parseJSON(body.alarms),
    }
  );

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );
  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );

  return createCommonResponse('CalDav calendar updated');
};
