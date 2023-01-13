import { EntityRepository, Repository, getRepository } from 'typeorm';

import { Attendee, EVENT_TYPE, Organizer } from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from '../../utils/enums';
import { DateTimeObject } from 'ical-js-parser';
import {
  createArrayQueryReplacement,
  getOneResult,
  parseToJSON,
} from '../../utils/common';
import { isElectron } from '../../config/env';
import { map } from 'lodash';
import { throwError } from '../../utils/errorCodes';
import CalDavEventEntity from '../entity/CalDavEventEntity';

export interface CalDavEventQueryResult {
  id: string;
  type: EVENT_TYPE;
  status: string | null;
  externalID: string;
  internalID?: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  timezoneEndAt: string | null;
  summary: string;
  props: any;
  description: string;
  allDay?: boolean;
  location: string;
  rRule: string | null;
  isRepeated: boolean;
  etag: string;
  href: string;
  color: string;
  eventCustomColor: string;
  customCalendarColor: string | null;
  calendarID: string;
  attendees: string;
  organizer: string;
  valarms: string;
  exdates: string;
  recurrenceID: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalDavEventsRaw {
  id: string;
  type: EVENT_TYPE;
  status: string | null;
  externalID: string;
  internalID?: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  timezoneEndAt: string | null;
  summary: string;
  props: any;
  description: string;
  allDay?: boolean;
  location: string;
  rRule: string | null;
  isRepeated: boolean;
  etag: string;
  href: string;
  color: string;
  eventCustomColor: string;
  customCalendarColor: string | null;
  calendarID: string;
  attendees: Attendee[] | null;
  organizer: Organizer | null;
  valarms: any[];
  exdates: any[];
  recurrenceID: DateTimeObject;
  createdAt: string;
  updatedAt: string;
}

const getComponentsCondition = (showTasks: boolean) => {
  if (!showTasks) {
    return [EVENT_TYPE.EVENT];
  }

  return [EVENT_TYPE.EVENT, EVENT_TYPE.TASK];
};

export const formatSQLDateTime = (column: string) => {
  if (isElectron) {
    return `strftime('%Y-%m-%dT%H:%M:%S.000Z', ${column})`;
  }

  return `to_char(${column}, 'YYYY-MM-DD"T"HH24:MI:SS."000Z"')`;
};

const formatEventData = (event: CalDavEventQueryResult): CalDavEventsRaw => {
  const eventResult = { ...event };

  const organizer: Organizer | null = parseToJSON(eventResult.organizer);
  const attendees: Attendee[] | null = parseToJSON(eventResult.attendees);
  const valarms: any[] | null = parseToJSON(eventResult.valarms);
  const exdates: any[] | null = parseToJSON(eventResult.exdates);
  const recurrenceID: DateTimeObject | null = parseToJSON(
    eventResult.recurrenceID
  );
  const props: any | null = parseToJSON(eventResult.props);

  return {
    ...event,
    organizer,
    attendees,
    valarms,
    exdates,
    recurrenceID,
    props,
  };
};

@EntityRepository(CalDavEventEntity)
export default class CalDavEventRepository extends Repository<CalDavEventEntity> {
  private static calDavEventRawProps = `
        e.id as "id",
        e.type as type,
        e.status as status,
        ${formatSQLDateTime('e.start_at')} as "startAt",
        ${formatSQLDateTime('e.end_at')} as "endAt",
        e.timezone_start_at as "timezoneStartAt",
        e.timezone_end_at as "timezoneEndAt",
        e.summary as "summary",
        e.location as "location",
        e.description as "description",
        e.all_day as "allDay",
        e.props as props,
        e.is_repeated as "isRepeated",
        e.r_rule as "rRule",
        e.external_id as "externalID",
        e.etag as "etag",
        e.href as "href",
        e.color as "eventCustomColor",
        e.attendees as "attendees",
        e.exdates as "exdates",
        e.valarms as "valarms",
        e.organizer as "organizer",
        e.recurrence_id as "recurrenceID",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        c.color as "color",
        c.custom_color as "customCalendarColor",
        c.id as "calendarID"
  `;

  public static getRepository() {
    return getRepository(CalDavEventEntity);
  }

  public static getCalDavEventsByID = async (userID: string) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND c.is_hidden IS FALSE
  `,
        [userID]
      );

    return map(resultCalDavEvents, formatEventData);
  };

  public static getEventsInRange = async (
    userID: string,
    rangeFrom: string,
    rangeTo: string,
    showTasks: boolean
  ) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND c.is_hidden IS FALSE
        AND e.is_repeated = FALSE
        AND e.start_at IS NOT NULL
        AND (
            e.start_at BETWEEN $2 AND $3 
            OR 
            e.end_at BETWEEN $2 AND $3)
        AND e.type IN (${createArrayQueryReplacement(
          getComponentsCondition(showTasks),
          4
        )})

  `,
        [userID, rangeFrom, rangeTo, ...getComponentsCondition(showTasks)]
      );

    return map(resultCalDavEvents, formatEventData);
  };

  public static getPublicEventsInRange = async (
    sharedCalDavCalendarIDs: string[],
    rangeFrom: string,
    rangeTo: string
  ) => {
    if (!sharedCalDavCalendarIDs?.length) {
      return Promise.resolve([]);
    }

    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
      WHERE 
        (e.start_at BETWEEN $1 AND $2 
          OR 
        e.end_at BETWEEN $1 AND $2)
        AND c.id IN (${createArrayQueryReplacement(sharedCalDavCalendarIDs, 3)})
        AND e.is_repeated = FALSE
            `,
        [rangeFrom, rangeTo, ...sharedCalDavCalendarIDs]
      );

    return map(resultCalDavEvents, formatEventData);
  };

  public static getEventByID = async (userID: string, id: string) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND e.id = $2
  `,
        [userID, id]
      );

    if (!resultCalDavEvents.length) {
      return null;
    }

    const result = map(resultCalDavEvents, formatEventData);

    return result[0];
  };

  public static getEventByExternalID = async (userID: string, id: string) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND e.external_id = $2
  `,
        [userID, id]
      );

    if (!resultCalDavEvents.length) {
      return null;
    }

    const result = map(resultCalDavEvents, formatEventData);

    return result[0];
  };

  public static getRepeatedEvents = async (
    userID: string,
    showTasks: boolean
  ) => {
    const repeatedEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c ON c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND c.is_hidden IS FALSE
        AND e.is_repeated = TRUE
        AND e.type IN (${createArrayQueryReplacement(
          getComponentsCondition(showTasks),
          2
        )})
  `,
        [userID, ...getComponentsCondition(showTasks)]
      );

    return map(repeatedEvents, formatEventData);
  };

  public static getPublicRepeatedEvents = async (
    calDavCalendarIDs: string[],
    showTasks: boolean
  ) => {
    if (!calDavCalendarIDs?.length) {
      return Promise.resolve([]);
    }

    const repeatedEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c ON c.id = e.caldav_calendar_id
      WHERE 
        c.id IN (${createArrayQueryReplacement(calDavCalendarIDs, 1)})
        AND e.is_repeated = TRUE
        AND e.type IN (${createArrayQueryReplacement(
          getComponentsCondition(showTasks),
          calDavCalendarIDs.length + 1
        )})
  `,
        [...calDavCalendarIDs, ...getComponentsCondition(showTasks)]
      );

    return map(repeatedEvents, formatEventData);
  };

  public static getCalDavEventByID = async (
    userID: string,
    id: string
  ): Promise<CalDavEventsRaw> => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND e.id = $2
  `,
        [userID, id]
      );

    if (!resultCalDavEvents.length) {
      return null;
    }

    return formatEventData(getOneResult(resultCalDavEvents));
  };

  public static getCalDavEventsByCalendarUrl = async (calendarUrl: string) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        e.id as id,
        e.href as href,
        e.etag as etag
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars cc ON cc.id = e.caldav_calendar_id
      WHERE 
        cc.url = $1
  `,
        [calendarUrl]
      );

    return map(resultCalDavEvents, formatEventData);
  };

  public static getCalDavEventsByIDForSync = async (
    userID: string,
    syncDate: string
  ) => {
    const resultCalDavEvents: CalDavEventQueryResult[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND (e.created_at > $2 OR e.updated_at > $2)
  `,
        [userID, syncDate]
      );

    return map(resultCalDavEvents, formatEventData);
  };

  static getExistingEventRaw = async (
    userID: string,
    eventID: string
  ): Promise<CalDavEventsRaw> => {
    const existingEventsRaw: {
      id: string;
      externalID: string;
      calendarID: string;
      attendees: Attendee[];
      organizer: Organizer;
      href: string;
      etag: string;
      props: {
        [BLOBEN_EVENT_KEY.INVITE_FROM]: string | undefined;
        [BLOBEN_EVENT_KEY.INVITE_TO]: string | undefined;
      };
    }[] = await CalDavEventRepository.getRepository().query(
      `
      SELECT
        e.id as id,
        e.external_id as "externalID",
        c.id as "calendarID",
        e.organizer as "organizer",
        e.attendees as "attendees",
        e.href as "href",
        e.etag as "etag",
        e.props as "props"
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

    const existingEvent = getOneResult(existingEventsRaw);

    if (!existingEvent) {
      throw throwError(404, 'Event not found');
    }

    if (!existingEvent.attendees?.length || !existingEvent.organizer) {
      throw throwError(409, 'Missing required event data');
    }

    return formatEventData(existingEvent);
  };
}
