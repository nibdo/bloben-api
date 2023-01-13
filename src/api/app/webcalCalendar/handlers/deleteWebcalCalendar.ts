import { Request, Response } from 'express';

import { createCommonResponse } from '../../../../utils/common';

import { CommonResponse } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';

import { socketService } from '../../../../service/init';
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

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`
  );

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`
  );

  return createCommonResponse();
};
