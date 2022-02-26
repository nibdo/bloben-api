import { Request, Response } from 'express';

import {
  createCommonResponse,
  createSocketCrudMsg,
} from '../../../utils/common';

import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateWebcalCalendarRequest } from '../../../bloben-interface/webcalCalendar/webcalCalendar';
import {
  SOCKET_APP_TYPE,
  SOCKET_CRUD_ACTION,
} from '../../../bloben-interface/enums';
import { SOCKET_CHANNEL, SOCKET_ROOM_NAMESPACE } from '../../../utils/enums';
import { io } from '../../../app';
import { throwError } from '../../../utils/errorCodes';
import WebcalCalendarEntity from '../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../data/repository/WebcalCalendarRepository';

export const createWebcalCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: CreateWebcalCalendarRequest = req.body;

  const existingWebcalCalendar: WebcalCalendarEntity | undefined =
    await WebcalCalendarRepository.getRepository().findOne({
      where: {
        url: body.url,
        // user_id: user.id
      },
    });

  if (existingWebcalCalendar) {
    throw throwError(409, 'Webcal calendar already exists');
  }

  const webcalCalendar: WebcalCalendarEntity = new WebcalCalendarEntity(
    body,
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.CALENDAR,
    createSocketCrudMsg(
      webcalCalendar.id,
      new Date().toISOString(),
      SOCKET_CRUD_ACTION.CREATE,
      SOCKET_APP_TYPE.WEBCAL_CALENDAR
    )
  );

  return createCommonResponse();
};
