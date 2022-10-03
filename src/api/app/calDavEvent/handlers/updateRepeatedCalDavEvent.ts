import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { CALENDAR_METHOD } from '../../../../utils/ICalHelper';
import {
  CalDavEventObj,
  createEventsFromDavObject,
  formatInviteData,
} from '../../../../utils/davHelper';
import {
  CommonResponse,
  EventResult,
  UpdateRepeatedCalDavEventRequest,
} from 'bloben-interface';
import { DateTime } from 'luxon';
import {
  DavRequestData,
  getDavRequestData,
} from '../../../../utils/davAccountHelper';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import {
  calDavSyncBullQueue,
  emailBullQueue,
} from '../../../../service/BullQueue';
import {
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  updateCalendarObject,
} from 'tsdav';
import { createCommonResponse } from '../../../../utils/common';
import { forEach } from 'lodash';
import { formatToIcalDateString } from '../../../../utils/luxonHelper';
import { io } from '../../../../app';
import { removeOrganizerFromAttendees } from './createCalDavEvent';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';
import logger from '../../../../utils/logger';

export interface RepeatEventUpdateResult {
  response: any;
  attendeesData?: {
    icalString: string;
    event: CalDavEventObj;
  }[];
}
export const createICalStringMultiEventForAttendees = (
  data: CalDavEventObj[]
) => {
  if (data[0]?.attendees?.length) {
    return new ICalHelperV2(data).parseTo();
  }
};
export const createICalStringForAttendees = (data: CalDavEventObj) => {
  if (data?.attendees?.length) {
    return new ICalHelperV2([data]).parseTo();
  }
};

export const eventResultToCalDavEventObj = (
  eventResult: EventResult,
  href?: string
): CalDavEventObj => {
  return {
    externalID: eventResult.externalID,
    calendarID: eventResult.calendarID,
    startAt: eventResult.startAt,
    endAt: eventResult.endAt,
    timezone: eventResult.timezoneStartAt,
    isRepeated: eventResult.isRepeated,
    summary: eventResult.summary,
    location: eventResult.location,
    description: eventResult.description,
    etag: eventResult.etag,
    color: eventResult.color,
    recurrenceID: eventResult.recurrenceID,
    organizer: eventResult?.organizer,
    alarms: eventResult?.valarms || [],
    attendees: eventResult?.attendees || [],
    exdates: eventResult?.exdates || [],
    rRule: eventResult.rRule,
    href: href,
  };
};

const handleSingleEventChange = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  davRequestData: DavRequestData
): Promise<RepeatEventUpdateResult> => {
  // filter by recurrence id of updated event
  let eventsData = eventsTemp.filter((event) => {
    if (event?.recurrenceID) {
      // eslint-disable-next-line no-empty
      if (event?.recurrenceID?.value === body.event.recurrenceID?.value) {
      } else {
        return event;
      }
    } else {
      return event;
    }
  });

  const eventItem = eventResultToCalDavEventObj(
    { ...body.event, rRule: undefined },
    eventsData[0].href
  );
  eventsData = [...eventsData, eventItem];

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await updateCalendarObject({
    headers: davRequestData.davHeaders,
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
        icalString: createICalStringForAttendees(eventItem),
        event: eventItem,
      },
    ],
  };
};

const handleChangeAllWithCalendar = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  calDavAccount: any,
  userID
): Promise<RepeatEventUpdateResult> => {
  // get only event with rrule prop
  let eventsData = eventsTemp.filter((event) => {
    if (event.rrule || event.rRule) {
      return event;
    }
  });

  // get account with calendar
  const calDavAccountNew =
    await CalDavAccountRepository.getByUserIDAndCalendarID(
      userID,
      body.calendarID
    );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  // combine original event with new version
  let startAtNew = DateTime.fromISO(body.event.startAt);
  let endAtNew = DateTime.fromISO(body.event.endAt);

  if (body.event.rRule === eventsData[0].rRule) {
    startAtNew = DateTime.fromISO(eventsData[0].startAt).set({
      hour: startAtNew.hour,
      minute: startAtNew.minute,
      second: 0,
      millisecond: 0,
    });

    endAtNew = DateTime.fromISO(eventsData[0].endAt).set({
      hour: endAtNew.hour,
      minute: endAtNew.minute,
      second: 0,
      millisecond: 0,
    });
  }

  eventsData = [
    eventResultToCalDavEventObj(
      {
        ...body.event,
        startAt: startAtNew.toString(),
        endAt: endAtNew.toString(),
        props: {
          exdate: undefined,
          recurrenceId: undefined,
        },
      },
      eventsData[0].href
    ),
  ];

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await createCalendarObject({
    headers: davRequestData.davHeaders,
    calendar: calDavAccountNew.calendar,
    filename: `${body.externalID}.ics`,
    iCalString: iCalString,
  });

  // delete prev event
  const responseDelete = await deleteCalendarObject({
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: body.prevEvent.url,
      etag: body.prevEvent.etag,
    },
  });

  if (responseDelete.status >= 300) {
    logger.error(
      `Status: ${responseDelete.status} Message: ${responseDelete.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot delete event: ${responseDelete.statusText}`);
  }

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringForAttendees(eventsData[0]),
        event: eventsData[0],
      },
    ],
  };
};

const handleChangeAll = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  userID: string
): Promise<RepeatEventUpdateResult> => {
  // get only event with rrule prop
  let eventsData = eventsTemp.filter((event) => {
    if (event.rrule || event.rRule) {
      return event;
    }
  });

  // combine original event with new version
  let startAtNew = DateTime.fromISO(body.event.startAt);
  let endAtNew = DateTime.fromISO(body.event.endAt);

  if (body.event.rRule === eventsData[0].rRule) {
    startAtNew = DateTime.fromISO(eventsData[0].startAt).set({
      hour: startAtNew.hour,
      minute: startAtNew.minute,
      second: 0,
      millisecond: 0,
    });
    endAtNew = DateTime.fromISO(eventsData[0].endAt).set({
      hour: endAtNew.hour,
      minute: endAtNew.minute,
      second: 0,
      millisecond: 0,
    });
  }

  eventsData = [
    eventResultToCalDavEventObj(
      {
        ...body.event,
        startAt: startAtNew.toString(),
        endAt: endAtNew.toString(),
        rRule:
          body.event.rRule === eventsData[0].rRule
            ? eventsData[0].rRule
            : body.event.rRule,
        exdates: [],
        recurrenceID: undefined,
      },
      eventsData[0].href
    ),
  ];

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await updateCalendarObject({
    headers: davRequestData.davHeaders,
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
  `,
    [body.event.externalID, userID]
  );

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringForAttendees(eventsData[0]),
        event: eventsData[0],
      },
    ],
  };
};

const handleChangeThisAndFuture = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  calDavAccount: any
): Promise<RepeatEventUpdateResult> => {
  let originRRule = '';
  let originalEventWithRRule;
  // get only event with rrule prop
  const eventsData = eventsTemp.map((event) => {
    if (event.rrule || event.rRule) {
      originRRule = event.rrule || event.rRule;
      const rRule = event.rRule.includes(';UNTIL')
        ? event.rRule.slice(0, event.rRule.indexOf(';UNTIL'))
        : event.rRule;

      originalEventWithRRule = {
        ...event,
        rRule: `${rRule};UNTIL=${formatToIcalDateString(
          DateTime.fromISO(body.event.startAt)
            .minus({
              day: 1,
            })
            .set({ hour: 23, minute: 59, second: 59 })
            .toString()
        )}`,
      };

      return originalEventWithRRule;
    } else {
      return event;
    }
  });

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const idNew = v4();
  const eventResultNew = {
    ...body.event,
    externalID: idNew,
    rRule: originRRule,
    recurrenceID: undefined,
  };
  const iCalStringNew: string = new ICalHelperV2([
    eventResultToCalDavEventObj(eventResultNew, eventsData[0].href),
  ]).parseTo();

  await updateCalendarObject({
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: body.url,
      data: iCalString,
      etag: body.etag,
    },
  });

  // create new event
  const response = await createCalendarObject({
    headers: davRequestData.davHeaders,
    calendar: calDavAccount.calendar,
    filename: `${idNew}.ics`,
    iCalString: iCalStringNew,
  });

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringMultiEventForAttendees(eventsData),
        event: eventResultToCalDavEventObj(
          originalEventWithRRule,
          eventsData[0].href
        ),
      },
      {
        icalString: createICalStringForAttendees(
          eventResultToCalDavEventObj(eventResultNew, eventsData[0].href)
        ),
        event: eventResultToCalDavEventObj(eventResultNew, eventsData[0].href),
      },
    ],
  };
};

interface Event extends EventResult {
  valarms?: any[];
  alarms?: any[];
}
interface Body extends UpdateRepeatedCalDavEventRequest {
  event: Event;
}
export const updateRepeatedCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: Body = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  body.event.valarms = body.event.alarms;

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  // get server events
  const fetchedEvents = await fetchCalendarObjects({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [body.url],
  });

  // format to event obj
  const eventsTemp = createEventsFromDavObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  if (
    body.type !== REPEATED_EVENT_CHANGE_TYPE.ALL &&
    body.event.attendees.length !== eventsTemp?.[0].attendees.length
  ) {
    throw throwError(409, 'Attendees can be changed only for all instances');
  }

  let result: RepeatEventUpdateResult;

  if (body.type !== REPEATED_EVENT_CHANGE_TYPE.ALL && body.prevEvent) {
    throw throwError(
      409,
      'Repeated event can update calendar only for all instances'
    );
  }

  if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL && body.prevEvent) {
    result = await handleChangeAllWithCalendar(
      eventsTemp,
      body,
      davRequestData,
      calDavAccount,
      userID
    );
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
    result = await handleSingleEventChange(eventsTemp, body, davRequestData);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    result = await handleChangeAll(eventsTemp, body, davRequestData, userID);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE) {
    result = await handleChangeThisAndFuture(
      eventsTemp,
      body,
      davRequestData,
      calDavAccount
    );
  }

  if (result.response.status >= 300) {
    logger.error(
      `Status: ${result.response.status} Message: ${result.response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot create event: ${result.response.statusText}`);
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.SYNCING, value: true })
  );

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  if (body.sendInvite && result.attendeesData.length) {
    const promises: any = [];

    forEach(result.attendeesData, (attendeesItem) => {
      if (attendeesItem.icalString && attendeesItem.event?.attendees) {
        promises.push(
          emailBullQueue.add(
            BULL_QUEUE.EMAIL,
            formatInviteData(
              userID,
              attendeesItem.event,
              attendeesItem.icalString,
              removeOrganizerFromAttendees(
                attendeesItem.event.organizer,
                attendeesItem.event.attendees
              ),
              CALENDAR_METHOD.REQUEST,
              body.inviteMessage
            )
          )
        );
      }
    });

    await Promise.all(promises);
  }

  return createCommonResponse('Event updated', {});
};
