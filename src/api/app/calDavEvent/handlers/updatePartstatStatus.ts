import { Request, Response } from 'express';

import { CommonResponse, UpdatePartstatStatusRequest } from 'bloben-interface';

import {
  BLOBEN_EVENT_KEY,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

export const updatePartstatStatus = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { eventID } = req.params;

  const body: UpdatePartstatStatusRequest = req.body;

  const existingEvent = await CalDavEventRepository.getExistingEventRaw(
    userID,
    eventID
  );

  const { eventTemp, attendeeNew } = await DavService.updatePartstat(
    userID,
    existingEvent.calendarID,
    existingEvent,
    existingEvent.attendees,
    existingEvent.organizer.mailto,
    body.status,
    existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_TO] ||
      existingEvent.organizer.mailto
  );

  if (body.sendInvite) {
    await InviteService.changePartstatStatus(
      eventTemp,
      userID,
      attendeeNew,
      body.status,
      body.inviteMessage
    );
  }

  if (eventTemp.attendees?.length) {
    await CalDavEventRepository.getRepository().update(eventID, {
      attendees: eventTemp.attendees,
    });
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse('Event partstat status updated');
};
