import { Request, Response } from 'express';

import { createCommonResponse } from '../../../../utils/common';

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

export const createWebcalCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: CreateWebcalCalendarRequest = req.body;

  const existingWebcalCalendar: any =
    await WebcalCalendarRepository.getRepository().query(
      `
      SELECT 
        wc.id, wc.url
      FROM webcal_calendars wc
      INNER JOIN users u ON u.id = wc.user_id
      WHERE 
        u.id = $1 
        AND wc.url = $2
        AND wc.deleted_at IS NULL
        AND u.deleted_at IS NULL
`,
      [user.id, body.url]
    );

  if (existingWebcalCalendar?.length) {
    throw throwError(409, 'Webcal calendar already exists');
  }

  const webcalCalendar: WebcalCalendarEntity = new WebcalCalendarEntity(
    body,
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  await QueueClient.syncWebcal(user.id);

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`
  );

  if (webcalCalendar.alarms) {
    await QueueClient.webcalReminders(webcalCalendar.id);
  }

  return createCommonResponse('Webcalendar created');
};
