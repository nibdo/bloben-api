import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { CommonResponse, DeleteCalDavEventRequest } from 'bloben-interface';
import {
  createCommonResponse,
  handleDavResponse,
} from '../../../../utils/common';
import { deleteCalendarObject } from 'tsdav';
import { emailBullQueue } from '../../../../service/BullQueue';
import { formatCancelInviteData } from '../../../../utils/davHelper';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { io } from '../../../../app';
import { removeOrganizerFromAttendees } from './createCalDavEvent';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import ICalHelper, { CALENDAR_METHOD } from '../../../../utils/ICalHelper';

export const deleteCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const response = await deleteCalendarObject({
    headers: davHeaders,
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  handleDavResponse(response, 'Delete caldav event error');

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  if (event.attendees && body.sendInvite) {
    const icalString = new ICalHelper(event).parseTo(CALENDAR_METHOD.CANCEL);

    await emailBullQueue.add(
      BULL_QUEUE.EMAIL,
      formatCancelInviteData(
        userID,
        event,
        icalString,
        removeOrganizerFromAttendees(event.organizer, event.attendees),
        CALENDAR_METHOD.CANCEL,
        body.inviteMessage
      )
    );
  }

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse('Event deleted');
};
