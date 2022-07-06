import { Request, Response } from 'express';

import { createCommonResponse } from '../../../utils/common';

import {
  BULL_QUEUE,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateWebcalCalendarRequest } from '../../../bloben-interface/webcalCalendar/webcalCalendar';

import { io } from '../../../app';
import { throwError } from '../../../utils/errorCodes';
import { webcalRemindersBullQueue } from '../../../service/BullQueue';
import WebcalCalendarEntity from '../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../data/repository/WebcalCalendarRepository';

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
      alarms: body.alarms,
      syncFrequency: body.syncFrequency,
      color: body.color,
      name: body.name,
      userMailto: body.userMailto,
    }
  );

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS })
  );
  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  await webcalRemindersBullQueue.add(BULL_QUEUE.WEBCAL_REMINDER, {
    webcalCalendarID: webcalCalendar.id,
  });

  return createCommonResponse();
};
