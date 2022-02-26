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

  webcalCalendar.update(body);

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${user.id}`).emit(
    SOCKET_CHANNEL.CALENDAR,
    createSocketCrudMsg(
      webcalCalendar.id,
      new Date().toISOString(),
      SOCKET_CRUD_ACTION.UPDATE,
      SOCKET_APP_TYPE.WEBCAL_CALENDAR
    )
  );

  return createCommonResponse();
};
