import { Request, Response } from 'express';

import { createCommonResponse } from '../../../../utils/common';

import { CommonResponse } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';

import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';

export const deleteWebcalCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const { params } = req;

  const webcalCalendar: WebcalCalendarEntity | undefined =
    await WebcalCalendarRepository.findByIdAndUserID(params.id, user.id);

  if (!webcalCalendar) {
    throw throwError(404, 'Webcal calendar not found');
  }

  await WebcalCalendarRepository.getRepository().delete(webcalCalendar.id);

  // io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
  //   SOCKET_CHANNEL.CALENDAR,
  //   createSocketCrudMsg(
  //     webcalCalendar.id,
  //     new Date().toISOString(),
  //     SOCKET_CRUD_ACTION.DELETE,
  //     SOCKET_APP_TYPE.WEBCAL_CALENDAR
  //   )
  // );

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS })
  );
  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse();
};
