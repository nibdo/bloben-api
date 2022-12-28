import { Request, Response } from 'express';

import { createCommonResponse, parseJSON } from '../../../../utils/common';

import { CommonResponse, CreateWebcalCalendarRequest } from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';

import { QueueClient, socketService } from '../../../../service/init';
import { throwError } from '../../../../utils/errorCodes';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';

export const updateWebcalCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const { params } = req;
  const body: CreateWebcalCalendarRequest = req.body;

  const webcalCalendar: WebcalCalendarEntity | undefined =
    await WebcalCalendarRepository.findByIdAndUserID(params.id, user.id);

  if (!webcalCalendar) {
    throw throwError(404, 'Webcal calendar not found');
  }

  await WebcalCalendarRepository.getRepository().update(
    {
      id: webcalCalendar.id,
    },
    {
      alarms: parseJSON(body.alarms),
      syncFrequency: body.syncFrequency,
      color: body.color,
      name: body.name,
      userMailto: body.userMailto,
    }
  );

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

  await QueueClient.webcalReminders(webcalCalendar.id);

  return createCommonResponse();
};
