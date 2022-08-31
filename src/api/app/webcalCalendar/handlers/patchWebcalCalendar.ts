import { Request, Response } from 'express';

import { createCommonResponse } from '../../../../utils/common';

import { CommonResponse } from '../../../../bloben-interface/interface';
import { PatchWebcalCalendarRequest } from '../../../../bloben-interface/webcalCalendar/webcalCalendar';

import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';

export const patchWebcalCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { params } = req;
  const body: PatchWebcalCalendarRequest = req.body;

  const webcalCalendar: WebcalCalendarEntity | undefined =
    await WebcalCalendarRepository.findByIdAndUserID(params.id, userID);

  if (!webcalCalendar) {
    throw throwError(404, 'Webcal calendar not found');
  }

  await WebcalCalendarRepository.getRepository().update(
    {
      id: params.id,
    },
    {
      isHidden: body.isHidden,
    }
  );

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS })
  );
  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse();
};
