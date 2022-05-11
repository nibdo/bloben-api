import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CALENDAR_METHOD } from '../../../utils/ICalHelper';
import {
  CalDavEventObj,
  createEventsFromDavObject,
  formatInviteData,
  formatRecurringCancelInviteData,
} from '../../../utils/davHelper';
import { CommonResponse } from '../../../bloben-interface/interface';
import { DAVClient } from 'tsdav';
import { DeleteRepeatedCalDavEventRequest } from '../../../bloben-interface/event/event';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../bloben-interface/enums';
import {
  calDavSyncBullQueue,
  emailBullQueue,
} from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { createICalStringForAttendees } from './updateRepeatedCalDavEvent';
import { forEach, map } from 'lodash';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventExceptionRepository from '../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../utils/ICalHelperV2';
import logger from '../../../utils/logger';

export interface RepeatEventDeleteResult {
  response: any;
  attendeesData?: {
    icalString: string;
    event: CalDavEventObj;
    method: CALENDAR_METHOD;
  }[];
}
const handleDeleteSingle = async (
  body: DeleteRepeatedCalDavEventRequest,
  client: DAVClient,
  calDavAccount: any
): Promise<RepeatEventDeleteResult> => {
  // get server events
  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [body.url],
  });

  // format to event obj
  let eventsTemp = createEventsFromDavObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  // filter by recurrence id of deleted event
  eventsTemp = map(eventsTemp, (item) => {
    if (item.rRule) {
      const exDates = item.exdates || [];
      const exdates = [...exDates, ...body.exDates];
      return { ...item, exdates };
    } else {
      return item;
    }
  });

  const iCalString: string = new ICalHelperV2(eventsTemp).parseTo();

  const response = await client.updateCalendarObject({
    calendarObject: {
      url: body.url,
      data: iCalString,
      etag: body.etag,
    },
  });

  return {
    response,
    attendeesData: [
      {
        method: CALENDAR_METHOD.REQUEST,
        icalString: createICalStringForAttendees(eventsTemp[0]),
        event: eventsTemp[0],
      },
    ],
  };
};

const handleDeleteSingleRecurrence = async (
  body: DeleteRepeatedCalDavEventRequest,
  client: DAVClient,
  calDavAccount: any,
  userID: string
): Promise<RepeatEventDeleteResult> => {
  // get server events
  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [body.url],
  });

  // format to event obj
  const eventsTemp = createEventsFromDavObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  let eventToDelete;

  // filter by recurrence id of deleted event
  const eventsData = map(
    eventsTemp.filter((event) => {
      if (event?.recurrenceID) {
        // eslint-disable-next-line no-empty
        if (event?.recurrenceID?.value === body.recurrenceID?.value) {
          eventToDelete = event;
        } else {
          return event;
        }
      } else {
        return event;
      }
    }),
    (item) => {
      if (item.rRule) {
        const exDates = item.exdates || [];
        const exdates = [...exDates, body.recurrenceID];
        return { ...item, exdates };
      } else {
        return item;
      }
    }
  );

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await client.updateCalendarObject({
    calendarObject: {
      url: body.url,
      data: iCalString,
      etag: body.etag,
    },
  });

  await CalDavEventExceptionRepository.getRepository().query(
    `
    DELETE FROM caldav_event_exceptions
     WHERE 
        external_id = $1
        AND user_id = $2
        AND exception_date = $3
  `,
    [eventsData[0]?.externalID, userID, body.recurrenceID?.value]
  );

  return {
    response,
    attendeesData: [
      // {
      //   method: CALENDAR_METHOD.REQUEST,
      //   icalString: createICalStringForAttendees(eventsData[0]),
      //   event: eventsData[0],
      // },
      {
        method: CALENDAR_METHOD.CANCEL,
        icalString: createICalStringForAttendees(eventToDelete),
        event: eventToDelete,
      },
    ],
  };
};

const handleDeleteAll = async (
  body: DeleteRepeatedCalDavEventRequest,
  client: DAVClient,
  calDavAccount: any
): Promise<RepeatEventDeleteResult> => {
  // get server events
  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [body.url],
  });

  // format to event obj
  const eventsTemp = createEventsFromDavObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  const response = await client.deleteCalendarObject({
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  return {
    response,
    attendeesData: [
      {
        method: CALENDAR_METHOD.CANCEL,
        icalString: createICalStringForAttendees(eventsTemp[0]),
        event: eventsTemp[0],
      },
    ],
  };
};

export const deleteRepeatedCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteRepeatedCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const client = await loginToCalDav(calDavAccount);

  let result;
  if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    result = await handleDeleteAll(body, client, calDavAccount);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE_RECURRENCE_ID) {
    result = await handleDeleteSingleRecurrence(
      body,
      client,
      calDavAccount,
      userID
    );
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
    result = await handleDeleteSingle(body, client, calDavAccount);
  }

  if (result.response.status >= 300) {
    logger.error(
      `Status: ${result.response.status} Message: ${result.response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot delete event: ${result.response.statusText}`);
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  if (body.sendInvite && result.attendeesData.length) {
    const promises: any = [];

    forEach(result.attendeesData, (attendeesItem) => {
      if (attendeesItem.icalString && attendeesItem.event?.attendees) {
        if (attendeesItem.method === CALENDAR_METHOD.REQUEST) {
          promises.push(
            emailBullQueue.add(
              BULL_QUEUE.EMAIL,
              formatInviteData(
                userID,
                attendeesItem.event,
                attendeesItem.icalString,
                attendeesItem.event.attendees,
                CALENDAR_METHOD.REQUEST
              )
            )
          );
        } else {
          promises.push(
            emailBullQueue.add(
              BULL_QUEUE.EMAIL,
              formatRecurringCancelInviteData(
                userID,
                attendeesItem.event,
                attendeesItem.icalString,
                attendeesItem.event.attendees,
                CALENDAR_METHOD.CANCEL,
                body.inviteMessage
              )
            )
          );
        }
      }
    });

    await Promise.all(promises);
  }

  return createCommonResponse('Event deleted');
};
