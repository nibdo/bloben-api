import { Request, Response } from 'express';

import { createCommonResponse } from '../../../../utils/common';

import { CommonResponse, PatchWebcalCalendarRequest } from 'bloben-interface';

import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { socketService } from '../../../../service/init';
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

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.WEBCAL_CALENDARS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );
  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );

  return createCommonResponse();
};
