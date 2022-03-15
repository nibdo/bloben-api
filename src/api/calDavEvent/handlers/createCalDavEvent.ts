import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';
import { createEventFromCalendarObject } from '../../../utils/davHelper';
import { emailBullQueue } from '../../../service/BullQueue';
import { formatEventInviteSubject } from '../../../utils/format';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { map } from 'lodash';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import logger from '../../../utils/logger';

export const createCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: CreateCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
    throw throwError(404, 'Account with calendar not found');
  }

  const client = await loginToCalDav(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

  const response: any = await client.createCalendarObject({
    calendar: calDavAccount.calendar,
    filename: `${body.externalID}.ics`,
    iCalString: body.iCalString,
  });
  if (response.status > 300) {
    logger.error(
      `Status: ${response.status} Message: ${response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, 'Cannot create event');
  }

  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
  });

  const eventTemp = createEventFromCalendarObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  if (eventTemp) {
    const newEvent = new CalDavEventEntity(eventTemp);

    await CalDavEventRepository.getRepository().save(newEvent);

    // @ts-ignore
    if (newEvent.props?.attendee) {
      await emailBullQueue.add(BULL_QUEUE.EMAIL, {
        userID,
        email: {
          subject: formatEventInviteSubject(
            newEvent.summary,
            eventTemp.startAt,
            eventTemp.timezoneStart
          ),
          body: formatEventInviteSubject(
            newEvent.summary,
            eventTemp.startAt,
            eventTemp.timezoneStart
          ),
          ical: body.iCalString,
          method: 'REQUEST',
          // @ts-ignore
          recipients: map(newEvent.props.attendee, 'mailto'),
        },
      });
    }
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  // delete cache
  // await CalDavCacheService.deleteByUserID(userID);

  // trigger resync for cached events
  // await CalDavCacheService.syncEventsForAccount(calDavAccount);

  return createCommonResponse('Event created');
};
