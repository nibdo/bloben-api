import { Request, Response } from 'express';

import { CommonResponse, PatchCalDavCalendarRequest } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';

export const patchCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { id } = req.params;
  const { userID } = res.locals;
  const body: PatchCalDavCalendarRequest = req.body;

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
      isHidden: body.isHidden,
    }
  );

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS })
  );
  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse('CalDav calendar updated');
};
