import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';

import { BULL_QUEUE, LOG_TAG } from '../../../utils/enums';
import {
  CalDavEventObj,
  createEventsFromDavObject,
} from '../../../utils/davHelper';
import { DAVClient } from 'tsdav';
import { DateTime } from 'luxon';
import {
  EventResult,
  UpdateRepeatedCalDavEventRequest,
} from '../../../bloben-interface/event/event';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../bloben-interface/enums';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { formatToIcalDateString } from '../../../utils/luxonHelper';
import { loginToCalDav } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventExceptionRepository from '../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../utils/ICalHelperV2';
import logger from '../../../utils/logger';

interface UpdateResult {
  response: any;
  attendeesData?: {
    icalString: string;
    event: CalDavEventObj;
  }[];
}

const createICalStringForAttendees = (data: any) => {
  if (data?.attendees?.length || data?.props?.attendee?.length) {
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
  client: DAVClient
): Promise<UpdateResult> => {
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
        icalString: createICalStringForAttendees(eventItem),
        event: eventItem,
      },
    ],
  };
};

const handleChangeAllWithCalendar = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  client: DAVClient,
  calDavAccount: any,
  userID
): Promise<UpdateResult> => {
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
  const startAtChanged = DateTime.fromISO(body.event.startAt);
  const endAtChanged = DateTime.fromISO(body.event.endAt);

  const startAtNew = DateTime.fromISO(eventsData[0].startAt).set({
    hour: startAtChanged.hour,
    minute: startAtChanged.minute,
    second: 0,
    millisecond: 0,
  });
  const endAtNew = DateTime.fromISO(eventsData[0].endAt).set({
    hour: endAtChanged.hour,
    minute: endAtChanged.minute,
    second: 0,
    millisecond: 0,
  });

  eventsData = [
    eventResultToCalDavEventObj(
      {
        ...body.event,
        startAt: startAtNew.toString(),
        endAt: endAtNew.toString(),
        rRule: eventsData[0].rRule,
        props: {
          exdate: undefined,
          recurrenceId: undefined,
        },
      },
      eventsData[0].href
    ),
  ];

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await client.createCalendarObject({
    calendar: calDavAccountNew.calendar,
    filename: `${body.externalID}.ics`,
    iCalString: iCalString,
  });

  // delete prev event
  await client.deleteCalendarObject({
    calendarObject: {
      url: body.prevEvent.url,
      etag: body.prevEvent.etag,
    },
  });

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringForAttendees(body.event),
        event: eventResultToCalDavEventObj(
          {
            ...body.event,
            startAt: startAtNew.toString(),
            endAt: endAtNew.toString(),
            rRule: eventsData[0].rRule,
            props: {
              exdate: undefined,
              recurrenceId: undefined,
            },
          },
          eventsData[0].href
        ),
      },
    ],
  };
};

const handleChangeAll = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  client: DAVClient,
  userID: string
): Promise<UpdateResult> => {
  // get only event with rrule prop
  let eventsData = eventsTemp.filter((event) => {
    if (event.rrule || event.rRule) {
      return event;
    }
  });

  // combine original event with new version
  const startAtChanged = DateTime.fromISO(body.event.startAt);
  const endAtChanged = DateTime.fromISO(body.event.endAt);

  const startAtNew = DateTime.fromISO(eventsData[0].startAt).set({
    hour: startAtChanged.hour,
    minute: startAtChanged.minute,
    second: 0,
    millisecond: 0,
  });
  const endAtNew = DateTime.fromISO(eventsData[0].endAt).set({
    hour: endAtChanged.hour,
    minute: endAtChanged.minute,
    second: 0,
    millisecond: 0,
  });

  eventsData = [
    eventResultToCalDavEventObj(
      {
        ...body.event,
        startAt: startAtNew.toString(),
        endAt: endAtNew.toString(),
        rRule: eventsData[0].rRule,
        exdates: [],
        recurrenceID: undefined,
      },
      eventsData[0].href
    ),
  ];

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
  `,
    [body.event.externalID, userID]
  );

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringForAttendees(eventsData),
        event: eventResultToCalDavEventObj({
          ...body.event,
          startAt: startAtNew.toString(),
          endAt: endAtNew.toString(),
          rRule: eventsData[0].rRule,
          props: { exdate: undefined, recurrenceId: undefined },
        }),
      },
    ],
  };
};

const handleChangeThisAndFuture = async (
  eventsTemp: CalDavEventObj[],
  body: UpdateRepeatedCalDavEventRequest,
  client: DAVClient,
  calDavAccount: any
): Promise<UpdateResult> => {
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

  await client.updateCalendarObject({
    calendarObject: {
      url: body.url,
      data: iCalString,
      etag: body.etag,
    },
  });

  // create new event
  const response = await client.createCalendarObject({
    calendar: calDavAccount.calendar,
    filename: `${idNew}.ics`,
    iCalString: iCalStringNew,
  });

  return {
    response,
    attendeesData: [
      {
        icalString: createICalStringForAttendees(eventsData),
        event: eventResultToCalDavEventObj(
          originalEventWithRRule,
          eventsData[0].href
        ),
      },
      {
        icalString: createICalStringForAttendees({
          ...body.event,
          externalId: idNew,
          rRule: originRRule,
        }),
        event: eventResultToCalDavEventObj(eventResultNew, eventsData[0].href),
      },
    ],
  };
};

export const updateRepeatedCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  // let connection: Connection | null;
  // let queryRunner: QueryRunner | null;

  const { userID } = res.locals;

  const body: UpdateRepeatedCalDavEventRequest = req.body;

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

  const client = await loginToCalDav(calDavAccount);

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

  let result: UpdateResult;

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
      client,
      calDavAccount,
      userID
    );
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
    result = await handleSingleEventChange(eventsTemp, body, client);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    result = await handleChangeAll(eventsTemp, body, client, userID);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE) {
    result = await handleChangeThisAndFuture(
      eventsTemp,
      body,
      client,
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

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('Event updated', {});
};
