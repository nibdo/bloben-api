import { filter, find, forEach, groupBy, map } from 'lodash';

import {
  ATTENDEE_PARTSTAT,
  ATTENDEE_ROLE,
  SOURCE_TYPE,
} from '../../../../data/types/enums';

import { Attendee, Organizer } from 'ical-js-parser';
import { DateTime } from 'luxon';
import { EVENT_TYPE, EventResult, EventStyle } from 'bloben-interface';
import {
  createArrayQueryReplacement,
  createZuluDateTime,
  parseBoolean,
  parseToJSON,
} from '../../../../utils/common';
import { formatSQLDateTime } from '../../../../data/repository/CalDavEventRepository';
import { getOccurrences } from './getRepeatedEvents';
import LuxonHelper from '../../../../utils/luxonHelper';
import WebcalEventExceptionRepository from '../../../../data/repository/WebcalEventExceptionRepository';
import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

export const getEventStyle = (
  partstat: ATTENDEE_PARTSTAT,
  role: ATTENDEE_ROLE,
  color: string,
  isDark: boolean
) => {
  const style: EventStyle = {};

  if (partstat === ATTENDEE_PARTSTAT.DECLINED) {
    style.textDecoration = 'line-through';
    style.border = `solid 1px ${color}`;
    style.backgroundColor = isDark ? 'rgb(29, 31, 38)' : 'white';
    style.color = isDark ? 'white' : 'black';
  }

  if (
    partstat === ATTENDEE_PARTSTAT.NEEDS_ACTION ||
    partstat === ATTENDEE_PARTSTAT.TENTATIVE
  ) {
    style.border = `solid 1px ${color}`;
    style.backgroundColor = isDark ? 'rgb(29, 31, 38)' : 'white';
    style.color = isDark ? 'white' : 'black';
  }

  return style;
};

export const getTaskStyle = (isChecked: boolean) => {
  const style: EventStyle = {};

  if (isChecked) {
    style.textDecoration = 'line-through';
  }

  return style;
};

export const parseWebcalStyle = (
  event: WebCalEventFormatted,
  isDark: boolean
) => {
  let style: EventStyle = {};

  if (event.webCalCalendar.userMailto) {
    // get user attendee
    const userAttendee = find(
      event.attendees,
      (item) => item.mailto === event.webCalCalendar.userMailto
    );

    const partstat = userAttendee?.['PARTSTAT'];

    style = getEventStyle(
      partstat,
      userAttendee?.['ROLE'],
      event.webCalCalendar.color,
      isDark
    );
  }

  return style;
};

interface WebCalExceptionRaw {
  exceptionDate: Date;
  externalID: string;
}
interface WebCalEventQueryResult {
  id: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  description: string;
  location: string;
  sequence: string;
  organizer: string;
  attendees: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string | null;
  createdAt: string;
  updatedAt: string;
  externalID: string;
  calendarID: string;
  color: string;
  userMailto: string | null;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WebCalEventRaw {
  id: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  description: string;
  location: string;
  sequence: string;
  organizer: Organizer | null;
  attendees: Attendee[] | null;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string | null;
  createdAt: string;
  updatedAt: string;
  externalID: string;
  calendarID: string;
  color: string;
  userMailto: string | null;
}
interface WebCalEventFormatted {
  id: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  summary: string;
  description: string;
  location: string;
  sequence: string;
  organizer: any;
  attendees: any;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string | null;
  createdAt: string;
  updatedAt: string;
  externalID: string;
  calendarID: string;
  webCalCalendar: {
    id: string;
    color: string;
    userMailto: string | null;
  };
}

export const formatWebCalEventRaw = (
  webCalEventRaw: WebCalEventQueryResult
): WebCalEventFormatted => ({
  id: webCalEventRaw.id,
  startAt: webCalEventRaw.startAt,
  endAt: webCalEventRaw.endAt,
  timezoneStartAt: webCalEventRaw.timezoneStartAt,
  timezoneEndAt: webCalEventRaw.timezoneEndAt || webCalEventRaw.timezoneStartAt,
  summary: webCalEventRaw.summary,
  description: webCalEventRaw.description,
  location: webCalEventRaw.location,
  sequence: webCalEventRaw.sequence,
  organizer: parseToJSON(webCalEventRaw.organizer),
  attendees: parseToJSON(webCalEventRaw.attendees),
  allDay: webCalEventRaw.allDay,
  isRepeated: webCalEventRaw.isRepeated,
  rRule: webCalEventRaw.rRule,
  createdAt: webCalEventRaw.createdAt,
  updatedAt: webCalEventRaw.updatedAt,
  externalID: webCalEventRaw.externalID,
  calendarID: webCalEventRaw.calendarID,
  webCalCalendar: {
    id: webCalEventRaw.calendarID,
    color: webCalEventRaw.color,
    userMailto: webCalEventRaw.userMailto,
  },
});

export const getWebcalEventByID = async (
  userID: string,
  id: string
): Promise<EventResult> => {
  const normalEventsRaw: WebCalEventQueryResult[] =
    await WebcalEventRepository.getRepository().query(
      `
    SELECT 
        DISTINCT 
        we.id as id,
        ${formatSQLDateTime('we.start_at')} as "startAt",
        ${formatSQLDateTime('we.end_at')} as "endAt",
        we.timezone_start_at as "timezoneStartAt",
        we.timezone_end_at as "timezoneEndAt",
        we.summary     as summary,
        we.description as description,
        we.location    as location,
        we.sequence    as sequence,
        we.organizer   as organizer,
        we.attendees   as attendees,
        we.all_day     as "allDay",
        we.is_repeated as "isRepeated",
        we.r_rule      as "rRule",
        we.created_at  as "createdAt",
        we.updated_at  as "updatedAt",
        we.external_id as "externalID",
        wc.id          as "calendarID",
        wc.color       as "color",
        wc.user_mailto as "userMailto"
    FROM webcal_events we
    INNER JOIN webcal_calendars wc on we.external_calendar_id = wc.id
    WHERE 
        we.is_repeated IS FALSE
        AND we.deleted_at IS NULL
        AND wc.deleted_at IS NULL
        AND wc.is_hidden IS FALSE
        AND wc.user_id = $1
        AND we.id = $2
  `,
      [userID, id]
    );

  if (!normalEventsRaw.length) {
    return null;
  }

  const event = normalEventsRaw[0];

  return {
    id: event.id,
    externalID: event.externalID,
    internalID: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    organizer: parseToJSON(event.organizer),
    attendees: parseToJSON(event.attendees),
    props: null,
    allDay: parseBoolean(event.allDay),
    calendarID: event.calendarID,
    color: event.color,
    startAt: event.startAt,
    endAt: event.endAt,
    timezoneEndAt: event.timezoneStartAt,
    timezoneStartAt: event.timezoneEndAt || event.timezoneStartAt,
    isRepeated: parseBoolean(event.isRepeated),
    rRule: event.rRule,
    sourceType: SOURCE_TYPE.WEBCAL,
    type: EVENT_TYPE.EVENT,
    createdAt: createZuluDateTime(event.createdAt),
    updatedAt: createZuluDateTime(event.updatedAt),
  };
};

export const getWebcalEvents = async (
  userID: string,
  rangeFrom: string,
  rangeTo: string,
  isDark: boolean
): Promise<EventResult[]> => {
  let result: WebCalEventFormatted[] = [];

  const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeFrom as string
  );
  const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeTo as string
  );

  const normalEventsQueryResult: WebCalEventQueryResult[] =
    await WebcalEventRepository.getRepository().query(
      `
    SELECT 
        DISTINCT 
        we.id as id,
        ${formatSQLDateTime('we.start_at')} as "startAt",
        ${formatSQLDateTime('we.end_at')} as "endAt",
        we.timezone_start_at as "timezoneStartAt",
        we.timezone_end_at as "timezoneEndAt",
        we.summary     as summary,
        we.description as description,
        we.location    as location,
        we.sequence    as sequence,
        we.organizer   as organizer,
        we.attendees   as attendees,
        we.all_day     as "allDay",
        we.is_repeated as "isRepeated",
        we.r_rule      as "rRule",
        we.created_at  as "createdAt",
        we.updated_at  as "updatedAt",
        we.external_id as "externalID",
        wc.id          as "calendarID",
        wc.color       as "color",
        wc.user_mailto as "userMailto"
    FROM webcal_events we
    INNER JOIN webcal_calendars wc on we.external_calendar_id = wc.id
    WHERE 
        we.is_repeated IS FALSE
        AND we.deleted_at IS NULL
        AND wc.deleted_at IS NULL
        AND wc.is_hidden IS FALSE
        AND wc.user_id = $1
        AND (we.start_at BETWEEN $2 AND $3 OR we.end_at BETWEEN $2 AND $3);
  `,
      [userID, rangeFrom, rangeTo]
    );

  const normalEvents = map(normalEventsQueryResult, formatWebCalEventRaw);

  const repeatedEventsRaw: WebCalEventQueryResult[] =
    await WebcalEventRepository.getRepository().query(
      `SELECT
                we.id as id,
                we.summary as summary,
                ${formatSQLDateTime('we.start_at')} as "startAt",
                ${formatSQLDateTime('we.end_at')} as "endAt",
                we.timezone_start_at as "timezoneStartAt",
                we.timezone_end_at as "timezoneEndAt",
                we.description as description,
                we.location as location,
                we.sequence as sequence,
                we.organizer as organizer,
                we.attendees as attendees,
                we.all_day as "allDay",
                we.is_repeated as "isRepeated",
                we.r_rule as "rRule",
                we.created_at as "createdAt",
                we.updated_at as "updatedAt",
                we.deleted_at as "deletedAt",
                we.external_id as "externalID",
                wc.id as "calendarID",
                wc.color as color,
                wc.user_mailto as "userMailto"
            FROM 
                webcal_events we
            LEFT JOIN 
                webcal_calendars wc ON we.external_calendar_id = wc.id
            WHERE 
                wc.user_id = $1
                AND we.is_repeated = TRUE 
                AND we.deleted_at IS NULL
                AND wc.is_hidden IS FALSE
                `,
      [userID]
    );

  const exceptions: WebCalExceptionRaw[] =
    await WebcalEventExceptionRepository.getRepository().query(
      `SELECT
                we.exception_date as "exceptionDate",
                we.external_id as "externalID"
            FROM 
                webcal_event_exceptions we
            LEFT JOIN
                webcal_calendars wc ON we.webcal_calendar_id = wc.id
            WHERE 
                wc.user_id = $1 
                AND wc.is_hidden IS FALSE
                AND wc.deleted_at IS NULL
                `,
      [userID]
    );

  const groupedExceptions: { [key: string]: WebCalExceptionRaw[] } = groupBy(
    exceptions,
    'externalID'
  );

  const groupedRepeatedEvents: { [key: string]: WebCalEventQueryResult[] } =
    groupBy(repeatedEventsRaw, 'id');

  const repeatedEvents: WebCalEventFormatted[] = [];

  forEach(groupedRepeatedEvents, (eventResult) => {
    let event: WebCalEventFormatted;

    forEach(eventResult, (item) => {
      // store only first main item
      if (!event) {
        event = formatWebCalEventRaw(item);
      }
    });

    repeatedEvents.push(event);
  });

  let repeatedEventsResult: WebCalEventFormatted[] = [];

  // process exceptions
  forEach(repeatedEvents, (event) => {
    const eventExceptions = groupedExceptions[event.externalID];
    const eventExceptionDates = map(
      eventExceptions,
      (exception) => exception.exceptionDate
    );

    let repeatedEvents = getOccurrences(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

    // remove dates colliding with exceptions
    if (eventExceptions && eventExceptions.length) {
      repeatedEvents = filter(repeatedEvents, (event) => {
        if (!eventExceptionDates.includes(event.startAt)) {
          return event;
        }
      });
    }

    repeatedEventsResult = [...repeatedEventsResult, ...repeatedEvents];
  });

  result = [...result, ...normalEvents, ...repeatedEventsResult];

  return map(result, (event) => ({
    id: event.id,
    externalID: event.externalID,
    internalID: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    sequence: event.sequence,
    organizer: event.organizer,
    attendees: event.attendees,
    alarms: [],
    props: null,
    // alarms: event.alarms ? event.alarms : [],
    allDay: parseBoolean(event.allDay),
    calendarID: event.webCalCalendar.id,
    color: event.webCalCalendar.color,
    startAt: event.startAt,
    endAt: event.endAt,
    timezoneEndAt: event.timezoneStartAt,
    timezoneStartAt: event.timezoneStartAt,
    isRepeated: parseBoolean(event.isRepeated),
    rRule: event.rRule,
    sourceType: SOURCE_TYPE.WEBCAL,
    type: EVENT_TYPE.EVENT,
    createdAt: createZuluDateTime(event.createdAt),
    updatedAt: createZuluDateTime(event.updatedAt),
    style: parseWebcalStyle(event, isDark),
    updateDisabled: true,
  }));
};

export const getSharedWebcalEvents = async (
  calendarIDs: string[],
  rangeFrom: string,
  rangeTo: string,
  isDark: boolean
): Promise<EventResult[]> => {
  let result: WebCalEventFormatted[] = [];

  const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeFrom as string
  );
  const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeTo as string
  );

  let normalEventsRaw: WebCalEventQueryResult[] = [];

  if (calendarIDs.length) {
    normalEventsRaw = await WebcalEventRepository.getRepository().query(
      `
    SELECT 
        DISTINCT
        we.id as id,
        ${formatSQLDateTime('we.start_at')} as "startAt",
        ${formatSQLDateTime('we.end_at')} as "endAt",
        we.timezone_start_at as "timezoneStartAt",
        we.summary     as summary,
        we.description as description,
        we.location    as location,
        we.sequence    as sequence,
        we.organizer   as organizer,
        we.attendees   as attendees,
        we.all_day     as "allDay",
        we.is_repeated as "isRepeated",
        we.r_rule      as "rRule",
        we.created_at  as "createdAt",
        we.updated_at  as "updatedAt",
        we.external_id as "externalID",
        wc.id          as "calendarID",
        wc.color       as "color",
        wc.user_mailto as "userMailto"
    FROM webcal_events we
    INNER JOIN webcal_calendars wc on we.external_calendar_id = wc.id
    WHERE 
        we.is_repeated IS FALSE
        AND we.deleted_at IS NULL
        AND wc.deleted_at IS NULL
        AND wc.is_hidden IS FALSE
        AND (we.start_at BETWEEN $1 AND $2 OR we.end_at BETWEEN $1 AND $2)
        AND wc.id IN (${createArrayQueryReplacement(calendarIDs, 3)});
  `,
      [rangeFrom, rangeTo, ...calendarIDs]
    );
  }

  const normalEvents = map(normalEventsRaw, formatWebCalEventRaw);

  let repeatedEventsRaw: WebCalEventQueryResult[] = [];
  if (calendarIDs.length) {
    repeatedEventsRaw = await WebcalEventRepository.getRepository().query(
      `SELECT
                we.id as id,
                we.summary as summary,
                ${formatSQLDateTime('we.start_at')} as "startAt",
                ${formatSQLDateTime('we.end_at')} as "endAt",
                we.timezone_start_at as "timezoneStartAt",
                we.description as description,
                we.location as location,
                we.sequence as sequence,
                we.organizer as organizer,
                we.attendees as attendees,
                we.all_day as "allDay",
                we.is_repeated as "isRepeated",
                we.r_rule as "rRule",
                we.created_at as "createdAt",
                we.updated_at as "updatedAt",
                we.deleted_at as "deletedAt",
                we.external_id as "externalID",
                wc.id as "calendarID",
                wc.color as color,
                wc.user_mailto as "userMailto"
            FROM 
                webcal_events we
            LEFT JOIN 
                webcal_calendars wc ON we.external_calendar_id = wc.id
            WHERE 
                wc.id IN (${createArrayQueryReplacement(calendarIDs, 1)})
                AND we.is_repeated = TRUE 
                AND we.deleted_at IS NULL
                AND wc.is_hidden IS FALSE
                `,
      [...calendarIDs]
    );
  }

  let exceptions: WebCalExceptionRaw[] = [];

  if (calendarIDs.length) {
    exceptions = await WebcalEventExceptionRepository.getRepository().query(
      `SELECT
                we.exception_date as "exceptionDate",
                we.external_id as "externalID"
            FROM 
                webcal_event_exceptions we
            LEFT JOIN
                webcal_calendars wc ON we.webcal_calendar_id = wc.id
            WHERE 
                wc.id IN (${createArrayQueryReplacement(calendarIDs, 1)}) 
                AND wc.is_hidden IS FALSE
                AND wc.deleted_at IS NULL
                `,
      [...calendarIDs]
    );
  }

  const groupedExceptions: { [key: string]: WebCalExceptionRaw[] } = groupBy(
    exceptions,
    'externalID'
  );

  const groupedRepeatedEvents: { [key: string]: WebCalEventQueryResult[] } =
    groupBy(repeatedEventsRaw, 'id');

  const repeatedEvents: WebCalEventFormatted[] = [];

  forEach(groupedRepeatedEvents, (eventResult) => {
    let event: WebCalEventFormatted;

    forEach(eventResult, (item) => {
      // store only first main item
      if (!event) {
        event = formatWebCalEventRaw(item);
      }
    });

    repeatedEvents.push(event);
  });

  let repeatedEventsResult: WebCalEventFormatted[] = [];

  // process exceptions
  forEach(repeatedEvents, (event) => {
    const eventExceptions = groupedExceptions[event.externalID];
    const eventExceptionDates = map(eventExceptions, (exception) =>
      exception.exceptionDate?.toISOString()
    );

    let repeatedEvents = getOccurrences(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

    // remove dates colliding with exceptions
    if (eventExceptions && eventExceptions.length) {
      repeatedEvents = filter(repeatedEvents, (event) => {
        if (!eventExceptionDates.includes(event.startAt.toISOString())) {
          return event;
        }
      });
    }

    repeatedEventsResult = [...repeatedEventsResult, ...repeatedEvents];
  });

  result = [...result, ...normalEvents, ...repeatedEventsResult];

  return map(result, (event) => ({
    id: event.id,
    externalID: event.externalID,
    internalID: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    sequence: event.sequence,
    organizer: event.organizer,
    attendees: event.attendees,
    alarms: [],
    props: null,
    // alarms: event.alarms ? event.alarms : [],
    allDay: parseBoolean(event.allDay),
    calendarID: event.webCalCalendar.id,
    color: event.webCalCalendar.color,
    startAt: event.startAt,
    endAt: event.endAt,
    timezoneEndAt: event.timezoneStartAt,
    timezoneStartAt: event.timezoneEndAt || event.timezoneStartAt,
    isRepeated: parseBoolean(event.isRepeated),
    rRule: event.rRule,
    sourceType: SOURCE_TYPE.WEBCAL,
    type: EVENT_TYPE.EVENT,
    createdAt: createZuluDateTime(event.createdAt),
    updatedAt: createZuluDateTime(event.updatedAt),
    style: parseWebcalStyle(event, isDark),
  }));
};
