import {
  ATTENDEE_PARTSTAT,
  Attendee,
  Range,
  UpdatePartstatStatusRepeatedEventRequest,
  UpdateRepeatedCalDavEventRequest,
} from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from '../utils/enums';
import {
  CalDavEventObj,
  createEventsFromCalendarObject,
  createEventsFromDavObject,
  filterOutEventWithRecurrenceID,
  formatEventJsonToCalDavEvent,
  formatIcalDate,
  makeDavCall,
  removeMethod,
} from '../utils/davHelper';
import {
  DAVCalendarObject,
  DAVClient,
  DAVCredentials,
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  updateCalendarObject,
} from 'tsdav';
import { DateTime } from 'luxon';
import { DateTimeObject, EventJSON } from 'ical-js-parser';
import {
  DavHeaders,
  DavRequestData,
  getDavRequestData,
} from '../utils/davAccountHelper';
import { EmailEventJobData } from '../jobs/queueJobs/processEmailEventJob';
import { REPEATED_EVENT_CHANGE_TYPE } from '../data/types/enums';
import {
  eventResultToCalDavEventObj,
  formatEventRawToCalDavObj,
} from '../utils/format';
import { filter, find, forEach, map } from 'lodash';
import { handleDavResponse, parseToJSON } from '../utils/common';
import { throwError } from '../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository, {
  CalDavAccount,
  CalDavAccountItem,
  CalendarFromAccount,
} from '../data/repository/CalDavAccountRepository';
import CalDavCalendarRepository from '../data/repository/CalDavCalendarRepository';
import CalDavEventExceptionRepository from '../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../utils/ICalHelperV2';
import LuxonHelper, { formatToIcalDateString } from '../utils/luxonHelper';

export const createDavClient = (
  url: string,
  auth: DAVCredentials | undefined
) => {
  if (!auth) {
    throw Error('Missing credentials');
  }
  return new DAVClient({
    serverUrl: url,
    credentials: {
      username: auth.username,
      password: auth.password,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
};

export const createAuthHeader = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

/**
 * Sync all events for all calendars in range
 * @param account
 * @param client
 * @param range
 */
export const syncCalDavEventsInRange = async (
  account: CalDavAccount,
  client: DAVClient,
  range: Range
): Promise<any[]> => {
  const calDavCalendars: any =
    await CalDavCalendarRepository.getRepository().query(
      `
      SELECT 
        c.id as id, 
        c.data as data
      FROM 
        caldav_calendars c
      WHERE
        c.caldav_account_id = $1
        AND c.deleted_at IS NULL;
    `,
      [account.id]
    );

  let resultEvents: any[] = [];

  for (const calDavCalendar of calDavCalendars) {
    const params: any = {
      calendar: JSON.parse(calDavCalendar.data),
      timeRange: {
        start: range.rangeFrom,
        end: range.rangeTo,
      },
    };

    const response: DAVCalendarObject[] = await client.fetchCalendarObjects(
      params
    );

    forEach(response, (item) => {
      if (item.data) {
        resultEvents = [
          ...resultEvents,
          ...createEventsFromCalendarObject(item, calDavCalendar, range),
        ];
      }
    });
  }

  return resultEvents;
};

interface DavAccountData {
  calDavAccount: CalDavAccountItem;
  davRequestData: DavRequestData;
}
export const getAccountWithCalendar = async (
  userID: string,
  calendarID: string
): Promise<DavAccountData> => {
  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    calendarID
  );

  if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
    throw throwError(404, 'Account with calendar not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);

  return {
    davRequestData,
    calDavAccount,
  };
};

interface EventResultBase {
  response: Response;
  calDavAccount: CalDavAccountItem;
  davRequestData: DavRequestData;
}

const createEventRaw = async (
  iCalString: string,
  id: string,
  calDavAccount: CalDavAccountItem,
  davRequestData: DavRequestData
) => {
  return await createCalendarObject({
    calendar: calDavAccount.calendar,
    filename: `${id}.ics`,
    iCalString: iCalString,
    headers: davRequestData.davHeaders,
  });
};

const createEvent = async (
  userID: string,
  calendarID: string,
  id: string,
  iCalString: string,
  account?: CalDavAccountItem,
  requestData?: DavRequestData
): Promise<EventResultBase> => {
  let calDavAccount;
  let davRequestData;

  if (account && davRequestData) {
    calDavAccount = account;
    davRequestData = requestData;
  } else {
    const { calDavAccount: accountResult, davRequestData: davRequestResult } =
      await getAccountWithCalendar(userID, calendarID);
    calDavAccount = accountResult;
    davRequestData = davRequestResult;
  }

  const response = await createEventRaw(
    iCalString,
    id,
    calDavAccount,
    davRequestData
  );

  handleDavResponse(
    response,
    `Create CalDAV event error ${response.statusText}`,
    iCalString
  );

  return { response, calDavAccount, davRequestData };
};

const createEventFromEmail = async (
  icalEvents: EventJSON[],
  data: EmailEventJobData,
  calendarID: string
): Promise<void> => {
  const { userID } = data;
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventObjs = map(icalEvents, (eventObj) => {
    // add metadata to event
    eventObj[BLOBEN_EVENT_KEY.INVITE_TO] = data.to;
    eventObj[BLOBEN_EVENT_KEY.INVITE_FROM] = data.from;
    eventObj[BLOBEN_EVENT_KEY.ORIGINAL_SEQUENCE] = eventObj?.sequence;

    return formatEventJsonToCalDavEvent(
      eventObj,
      {
        etag: undefined,
        url: undefined,
      },
      calDavAccount.calendar
    );
  });

  const icalStringNew: string = new ICalHelperV2(eventObjs, true).parseTo();

  const response = await createCalendarObject({
    headers: davRequestData.davHeaders,
    calendar: calDavAccount.calendar,
    filename: `${eventObjs[0]?.uid || eventObjs[0]?.externalID}.ics`,
    iCalString: removeMethod(icalStringNew),
  });

  handleDavResponse(
    response,
    `Create CalDAV event from email error ${response.statusText}`,
    icalStringNew
  );
};

const deleteEvent = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw | { etag: string; href: string },
  calDavAccountValue?: CalDavAccountItem,
  davRequestDataValue?: DavRequestData
) => {
  let calDavAccount;
  let davRequestData;

  if (!calDavAccountValue && !davRequestDataValue) {
    const { calDavAccount: account, davRequestData: davData } =
      await getAccountWithCalendar(userID, calendarID);

    calDavAccount = account;
    davRequestData = davData;
  } else {
    calDavAccount = calDavAccountValue;
    davRequestData = davRequestDataValue;
  }

  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      etag: event.etag,
    },
  };

  const response = await makeDavCall(
    deleteCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    userID,
    event.href
  );

  handleDavResponse(response, 'Delete caldav event error');

  return { response };
};

const getServerEvents = async (
  davHeaders: DavHeaders,
  calendar: CalendarFromAccount,
  url: string
) => {
  return fetchCalendarObjects({
    headers: davHeaders,
    calendar: calendar,
    objectUrls: [url],
  });
};

const formatServerEventsToCalDavEventObj = (
  events: DAVCalendarObject[],
  calendar: CalendarFromAccount
) => {
  let result: CalDavEventObj[] = [];

  forEach(events, (event) => {
    result = [...result, ...createEventsFromDavObject(event, calendar)];
  });

  return result;
};

const getAndFormatServerEvents = async (
  davHeaders: DavHeaders,
  url: string,
  calendar: CalendarFromAccount
) => {
  const events = await getServerEvents(davHeaders, calendar, url);

  return formatServerEventsToCalDavEventObj(events, calendar);
};

const deleteSingleRepeatedEvent = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  bodyExdates: DateTimeObject[]
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  let eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    event.href,
    calDavAccount.calendar
  );

  // filter by recurrence id of deleted event
  eventsTemp = map(eventsTemp, (item) => {
    if (item.rRule) {
      const exDates = item.exdates || [];
      const exdates = [...exDates, ...bodyExdates];
      return { ...item, exdates };
    } else {
      return item;
    }
  });

  const iCalString: string = new ICalHelperV2(eventsTemp).parseTo();

  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };
  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(
    response,
    'Delete single caldav repeated event error',
    iCalString
  );

  return {
    eventsTemp,
    response,
  };
};

const deleteExistingException = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  recurrenceID: DateTimeObject
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    event.href,
    calDavAccount.calendar
  );

  // let eventToDelete;

  // filter by recurrence id of deleted event
  const eventsData = map(
    eventsTemp.filter((event) => {
      if (event?.recurrenceID) {
        // eslint-disable-next-line no-empty
        if (event?.recurrenceID?.value === recurrenceID?.value) {
          // eventToDelete = event;
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
        const exdates = [...exDates, recurrenceID];
        return { ...item, exdates };
      } else {
        return item;
      }
    }
  );

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };
  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(
    response,
    'Delete exception caldav event error',
    iCalString
  );

  return {
    eventsTemp,
    response,
    eventsData,
  };
};

const updateEvent = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  iCalString: string,
  account?: CalDavAccountItem,
  requestData?: DavRequestData
): Promise<EventResultBase> => {
  let calDavAccount;
  let davRequestData;

  if (account && requestData) {
    calDavAccount = account;
    davRequestData = requestData;
  } else {
    const { calDavAccount: accountResult, davRequestData: requestData } =
      await getAccountWithCalendar(userID, calendarID);
    calDavAccount = accountResult;
    davRequestData = requestData;
  }

  const data = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };

  const response = await makeDavCall(
    updateCalendarObject,
    data,
    davRequestData,
    calDavAccount.calendar,
    userID,
    event.href
  );

  handleDavResponse(
    response,
    `Update CalDAV event error ${response.statusText}`,
    iCalString
  );

  return { response, calDavAccount, davRequestData };
};

const updatePartstat = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  attendees: Attendee[],
  from: string,
  partstat?: ATTENDEE_PARTSTAT,
  to?: string
) => {
  // find attendee
  const attendeeNew = find(attendees, (attendee) => {
    if (to) {
      return attendee.mailto === to;
    } else {
      return attendee.mailto === from;
    }
  });

  if (!attendeeNew) {
    throw throwError(409, 'Attendee not found');
  }

  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventTemp: CalDavEventObj = (
    await getAndFormatServerEvents(
      davRequestData.davHeaders,
      event.href,
      calDavAccount.calendar
    )
  )?.[0];

  if (eventTemp?.attendees?.length) {
    eventTemp.attendees = eventTemp.attendees.map((item) => {
      if (item.mailto === attendeeNew.mailto || item.mailto === to) {
        return {
          ...item,
          PARTSTAT: partstat || attendeeNew.PARTSTAT,
        };
      } else {
        return item;
      }
    });

    const icalStringNew: string = new ICalHelperV2([eventTemp], true).parseTo();

    const requestData = {
      headers: davRequestData.davHeaders,
      calendarObject: {
        url: event.href,
        data: icalStringNew,
        etag: event.etag,
      },
    };
    const response = await makeDavCall(
      updateCalendarObject,
      requestData,
      davRequestData,
      calDavAccount.calendar,
      calDavAccount.calendar.userID,
      event.href
    );

    handleDavResponse(
      response,
      `Update event PARTSTAT error with status: ${response.status} ${response.statusText}`,
      icalStringNew
    );
  }

  return {
    eventTemp,
    attendeeNew,
  };
};

const updateSingleRepeatedEvent = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    event.href,
    calDavAccount.calendar
  );

  // filter by recurrence id of updated event
  let eventsData = filterOutEventWithRecurrenceID(
    eventsTemp,
    body.event.recurrenceID
  );

  const eventItem = eventResultToCalDavEventObj(
    { ...body.event, rRule: undefined },
    eventsData[0].href
  );

  if (
    body.type !== REPEATED_EVENT_CHANGE_TYPE.ALL &&
    body.event.attendees &&
    eventsTemp?.[0]?.attendees &&
    body.event.attendees.length !== eventsTemp?.[0].attendees.length
  ) {
    throw throwError(409, 'Attendees can be changed only for all instances');
  }

  eventsData = [...eventsData, eventItem];

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const response = await makeDavCall(
    updateCalendarObject,
    {
      headers: davRequestData.davHeaders,
      calendarObject: {
        url: body.url,
        data: iCalString,
        etag: body.etag,
      },
    },
    davRequestData,
    calDavAccount.calendar,
    userID,
    body.url
  );

  return {
    response,
    eventItem,
  };
};

const updateRepeatedAllWithCalendarChange = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    body.url,
    calDavAccount.calendar
  );

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

  const { response } = await createEvent(
    userID,
    calDavAccountNew.calendarID,
    body.externalID,
    iCalString,
    calDavAccountNew,
    davRequestData
  );

  // delete prev event
  await deleteEvent(userID, calDavAccount.calendarID, {
    href: body.prevEvent.url,
    etag: body.prevEvent.etag,
  });

  return { response, eventsData, iCalString };
};

const handleChangeAll = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    body.url,
    calDavAccount.calendar
  );

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

  const { response } = await updateEvent(
    userID,
    body.calendarID,
    event,
    iCalString
  );

  return {
    response,
    eventsData,
    iCalString,
  };
};

const changeThisAndFutureUntilEvent = async (
  userID: string,
  calendarID: string,
  event: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    body.url,
    calDavAccount.calendar
  );

  let originRRule = '';
  let originalEventWithRRule;

  const untilDatetime = DateTime.fromISO(body.event.startAt)
    .minus({
      day: 1,
    })
    .set({ hour: 23, minute: 59, second: 59 });
  const untilDate = formatToIcalDateString(untilDatetime.toString());

  // get only event with rrule prop
  let eventsData = eventsTemp.map((event) => {
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

  // filter all exceptions after until date
  eventsData = filter(eventsData, (item) => {
    if (item.recurrenceID) {
      if (LuxonHelper.isBefore(item.recurrenceID?.value, untilDate)) {
        return item;
      }
    } else {
      return item;
    }
  });

  const iCalString: string = new ICalHelperV2(eventsData).parseTo();

  const { response } = await updateEvent(
    userID,
    body.calendarID,
    event,
    iCalString,
    calDavAccount,
    davRequestData
  );

  return {
    response,
    calDavAccount,
    davRequestData,
    originRRule,
    originalEventWithRRule,
    eventsData,
    iCalString,
  };
};

const createNewEventForThisAndFuture = async (
  userID: string,
  calDavAccount: CalDavAccountItem,
  davRequestData: DavRequestData,
  body: UpdateRepeatedCalDavEventRequest,
  originRRule: string,
  eventsData: CalDavEventObj[]
) => {
  // create new event
  const idNew = v4();
  const eventResultNew = {
    ...body.event,
    externalID: idNew,
    rRule: originRRule,
    recurrenceID: undefined,
  };

  const dataNew = eventResultToCalDavEventObj(
    eventResultNew,
    eventsData[0].href
  );
  const iCalStringNew: string = new ICalHelperV2([dataNew]).parseTo();

  const { response } = await createEvent(
    userID,
    body.calendarID,
    idNew,
    iCalStringNew,
    calDavAccount,
    davRequestData
  );

  return { response, iCalStringNew, dataNew };
};

/**
 * Update user partstat in all events
 * @param events
 * @param partstat
 * @param userMailto
 */
const formatAllEvents = (
  events: CalDavEventObj[],
  partstat: ATTENDEE_PARTSTAT,
  userMailto: string
): CalDavEventObj[] => {
  return map(events, (event) => {
    return {
      ...event,
      attendees: formatAttendeesSingleEvent(event, partstat, userMailto),
    };
  });
};

/**
 * Set partstat only for user
 * @param event
 * @param partstat
 * @param userMailto
 */
const formatAttendeesSingleEvent = (
  event: CalDavEventsRaw | CalDavEventObj,
  partstat: ATTENDEE_PARTSTAT,
  userMailto: string
): Attendee[] => {
  return map(parseToJSON(event.attendees), (item) => {
    if (item.mailto === userMailto) {
      return {
        ...item,
        PARTSTAT: partstat,
      };
    } else {
      return item;
    }
  });
};

/**
 * Change all partstat status for user
 * Set partstat in all existing exceptions
 * Returns calendar objects for creating iCal string
 */
const updatePartstatRepeatedChangeAll = async (
  userID: string,
  body: UpdatePartstatStatusRepeatedEventRequest,
  event: CalDavEventsRaw,
  userMailto: string
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    event.calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    event.href,
    calDavAccount.calendar
  );

  const eventObjs = formatAllEvents(eventsTemp, body.status, userMailto);
  const iCalString = new ICalHelperV2(eventObjs).parseTo();

  // create on server
  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };
  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(
    response,
    'Update partstat for all events failed',
    iCalString
  );

  return eventObjs;
};

/**
 * Set partstat status for single instance of recurring event
 * If exception does not exist, create new with only user attendee
 * If exception exists, update only exception
 * Returns single calendar object for creating iCal string
 */
const updatePartstatSingleRepeated = async (
  userID: string,
  event: CalDavEventsRaw,
  body: UpdatePartstatStatusRepeatedEventRequest,
  userMailto: string
) => {
  if (!body.recurrenceID) {
    throw throwError(403, 'Recurrence ID required');
  }

  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    event.calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    event.href,
    calDavAccount.calendar
  );

  // check if recurrence exists
  const exception =
    await CalDavEventExceptionRepository.getExceptionByExternalEventIDAndDate(
      userID,
      event.externalID,
      body.recurrenceID
    );

  const newAttendees = formatAttendeesSingleEvent(
    event,
    body.status,
    userMailto
  );

  let iCalString;
  let iCalObj;

  // create new exception with all attendees from base event
  // and updated partstat for user
  if (!exception && body.startAt) {
    iCalObj = formatEventRawToCalDavObj({
      ...event,
      recurrenceID: body.recurrenceID,
      startAt: body.startAt,
      endAt: body.endAt,
      attendees: newAttendees,
      rRule: undefined,
    });

    iCalString = new ICalHelperV2([...eventsTemp, iCalObj], true).parseTo();
    // send email only if organizer is not current user
  } else {
    const exceptionEvent = await CalDavEventRepository.getCalDavEventByID(
      userID,
      exception.caldavEventID
    );

    iCalObj = formatEventRawToCalDavObj({
      ...exceptionEvent,
      recurrenceID: body.recurrenceID,
      attendees: newAttendees,
      rRule: undefined,
    });

    // remove original recurrence event and replace with updated obj
    iCalString = new ICalHelperV2(
      [
        ...eventsTemp.filter(
          (item) =>
            item.recurrenceID?.value !==
            formatIcalDate(body.recurrenceID.value, body.recurrenceID.timezone)
        ),
        iCalObj,
      ],
      true
    ).parseTo();
  }

  // create on server
  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };

  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(
    response,
    'Update partstat for single event failed',
    iCalString
  );

  return [iCalObj];
};

const updateEventFromInvite = async (
  userID: string,
  existingEvent: CalDavEventsRaw,
  icalEvent: EventJSON,
  data: EmailEventJobData
) => {
  const { calDavAccount, davRequestData } = await getAccountWithCalendar(
    userID,
    existingEvent.calendarID
  );

  const eventsTemp = await getAndFormatServerEvents(
    davRequestData.davHeaders,
    existingEvent.href,
    calDavAccount.calendar
  );

  const eventObj = formatEventJsonToCalDavEvent(
    icalEvent,
    {
      etag: existingEvent.etag,
      url: existingEvent.href,
    },
    calDavAccount.calendar
  );

  // add metadata to event
  eventObj.props[BLOBEN_EVENT_KEY.INVITE_TO] = data.to;
  eventObj.props[BLOBEN_EVENT_KEY.INVITE_FROM] = data.from;
  eventObj.props[BLOBEN_EVENT_KEY.ORIGINAL_SEQUENCE] =
    eventObj.props?.sequence || eventObj.sequence;

  let icalStringNew;
  if (eventObj.recurrenceID) {
    const eventsData = filter(
      eventsTemp,
      (item) => item.recurrenceID?.value !== eventObj.recurrenceID?.value
    );

    icalStringNew = new ICalHelperV2([...eventsData, eventObj], true).parseTo();
  } else {
    icalStringNew = new ICalHelperV2([eventObj], true).parseTo();
  }

  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: existingEvent.href,
      data: removeMethod(icalStringNew),
      etag: existingEvent.etag,
    },
  };

  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    userID,
    existingEvent.href
  );

  handleDavResponse(
    response,
    'Update event from email import error',
    icalStringNew
  );

  return {
    response,
  };
};

export const DavService = {
  createEventRaw,
  createEvent,
  createEventFromEmail,
  deleteEvent,
  deleteSingleRepeatedEvent,
  deleteExistingException,
  updateEvent,
  getAndFormatServerEvents,
  updatePartstat,
  updateSingleRepeatedEvent,
  updateRepeatedAllWithCalendarChange,
  handleChangeAll,
  changeThisAndFutureUntilEvent,
  createNewEventForThisAndFuture,
  updatePartstatRepeatedChangeAll,
  updatePartstatSingleRepeated,
  updateEventFromInvite,
};
