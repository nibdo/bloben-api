import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { DeleteCalDavEventRequest } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';
import { emailBullQueue } from '../../../service/BullQueue';
import { formatCancelInviteData } from '../../../utils/davHelper';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { removeOrganizerFromAttendees } from './createCalDavEvent';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import ICalHelper, { CALENDAR_METHOD } from '../../../utils/ICalHelper';

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
    throw throwError('404', 'Account not found');
  }

  const client = await loginToCalDav(calDavAccount);

  await client.deleteCalendarObject({
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError('404', 'Event not found');
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
