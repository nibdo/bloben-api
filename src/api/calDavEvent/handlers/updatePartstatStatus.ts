import { Request, Response } from 'express';

import {
  Attendee,
  Organizer,
  UpdatePartstatStatusRequest,
} from '../../../bloben-interface/event/event';
import { CommonResponse } from '../../../bloben-interface/interface';

import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { createCommonResponse } from '../../../utils/common';
import { io } from '../../../app';
import { throwError } from '../../../utils/errorCodes';
import { updatePartstatStatusForAttendee } from '../../../jobs/queueJobs/processEmailEventJob';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';

export const updatePartstatStatus = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { eventID } = req.params;

  const body: UpdatePartstatStatusRequest = req.body;

  // check if event exists and is only response
  const existingEventRaw: {
    id: string;
    externalID: string;
    calendarID: string;
    attendees: Attendee[];
    organizer: Organizer;
    href: string;
    etag: string;
  }[] = await CalDavEventRepository.getRepository().query(
    `
      SELECT
        e.id as id,
        e.external_id as "externalID",
        c.id as "calendarID",
        e.organizer as "organizer",
        e.attendees as "attendees",
        e.href as "href",
        e.etag as "etag"
      FROM caldav_events e
      INNER JOIN caldav_calendars c ON c.id = e.caldav_calendar_id
      INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        c.deleted_at IS NULL
        AND a.deleted_at IS NULL  
        AND a.user_id = $1
        AND e.id = $2
    `,
    [userID, eventID]
  );

  if (!existingEventRaw.length) {
    throw throwError(404, 'Event not found');
  }

  const existingEvent = existingEventRaw[0];

  if (!existingEvent.attendees?.length || !existingEvent.organizer) {
    throw throwError(409, 'Missing required event data');
  }

  const newAttendees = await updatePartstatStatusForAttendee(
    existingEvent.attendees,
    userID,
    existingEvent.organizer.mailto,
    existingEvent.calendarID,
    existingEvent.etag,
    existingEvent.href,
    body.status,
    body.sendInvite,
    body.inviteMessage
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
