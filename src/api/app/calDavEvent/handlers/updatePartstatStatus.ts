import { Request, Response } from 'express';

import { CommonResponse, UpdatePartstatStatusRequest } from 'bloben-interface';

import {
  BLOBEN_EVENT_KEY,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';
import { updatePartstatStatusForAttendee } from '../../../../jobs/queueJobs/processEmailEventJob';
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

  const newAttendees = await updatePartstatStatusForAttendee(
    existingEvent.attendees,
    userID,
    existingEvent.organizer.mailto,
    existingEvent.calendarID,
    existingEvent.etag,
    existingEvent.href,
    body.status,
    body.sendInvite,
    body.inviteMessage,
    existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_TO]
  );

  if (newAttendees?.length) {
    await CalDavEventRepository.getRepository().update(eventID, {
      attendees: newAttendees,
    });
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse('Event partstat status updated');
};
