import { Request, Response } from 'express';

import { createCommonResponse } from '../../../utils/common';

import { BULL_QUEUE } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateWebcalCalendarRequest } from '../../../bloben-interface/webcalCalendar/webcalCalendar';

import { throwError } from '../../../utils/errorCodes';
import { webcalSyncBullQueue } from '../../../service/BullQueue';
import WebcalCalendarEntity from '../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../data/repository/WebcalCalendarRepository';

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

  await webcalSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID: user.id });

  // io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
  //   SOCKET_CHANNEL.CALENDAR,
  //   createSocketCrudMsg(
  //     webcalCalendar.id,
  //     new Date().toISOString(),
  //     SOCKET_CRUD_ACTION.CREATE,
  //     SOCKET_APP_TYPE.WEBCAL_CALENDAR
  //   )
  // );

  return createCommonResponse('Webcalendar created');
};