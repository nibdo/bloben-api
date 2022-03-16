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
import { formatEventInviteSubject } from '../../../utils/format';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { map } from 'lodash';
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

  const client = await loginToCalDav(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

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

  // @ts-ignore
  if (event.props?.attendee) {
    const icalString = new ICalHelper(event).parseTo(CALENDAR_METHOD.CANCEL);

    await emailBullQueue.add(BULL_QUEUE.EMAIL, {
      userID,
      email: {
        subject: formatEventInviteSubject(
          event.summary,
          event.startAt,
          event.timezoneStart
        ),
        body: formatEventInviteSubject(
          event.summary,
          event.startAt,
          event.timezoneStart
        ),
        ical: icalString,
        method: CALENDAR_METHOD.CANCEL,
        // @ts-ignore
        recipients: map(event.props.attendee, 'mailto'),
      },
    });
  }

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  // delete cache
  // await CalDavCacheService.deleteByUserID(userID);

  // trigger resync for cached events
  // await CalDavCacheService.syncEventsForAccount(calDavAccount);

  return createCommonResponse('Event deleted');
};
