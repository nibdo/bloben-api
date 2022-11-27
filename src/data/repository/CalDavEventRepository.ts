import { EntityRepository, Repository, getRepository } from 'typeorm';

import { Attendee, EVENT_TYPE, Organizer } from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from '../../utils/enums';
import { DateTimeObject } from 'ical-js-parser';
import { getOneResult } from '../../utils/common';
import { throwError } from '../../utils/errorCodes';
import CalDavEventEntity from '../entity/CalDavEventEntity';

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
  attendees: any[];
  organizer: any;
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

@EntityRepository(CalDavEventEntity)
export default class CalDavEventRepository extends Repository<CalDavEventEntity> {
  private static calDavEventRawProps = `
        e.id as "id",
        e.type as type,
        e.status as status,
        e.start_at as "startAt",
        e.end_at as "endAt",
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
    const resultCalDavEvents: CalDavEventsRaw[] =
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

    return resultCalDavEvents;
  };

  public static getEventsInRange = async (
    userID: string,
    rangeFrom: string,
    rangeTo: string,
    showTasks: boolean
  ) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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
        AND e.type = ANY ($4)
        AND (e.start_at, e.end_at) OVERLAPS (CAST($2 AS timestamp), CAST($3 AS timestamp))
  `,
        [userID, rangeFrom, rangeTo, getComponentsCondition(showTasks)]
      );

    return resultCalDavEvents;
  };

  public static getPublicEventsInRange = async (
    sharedCalDavCalendarIDs: string[],
    rangeFrom: string,
    rangeTo: string
  ) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c on c.id = e.caldav_calendar_id
      WHERE 
        c.id = ANY($1)
        AND e.is_repeated = FALSE
        AND (e.start_at, e.end_at) OVERLAPS (CAST($2 AS timestamp), CAST($3 AS timestamp))
  `,
        [sharedCalDavCalendarIDs, rangeFrom, rangeTo]
      );

    return resultCalDavEvents;
  };

  public static getEventByID = async (userID: string, id: string) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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
        AND e.id = $2
  `,
        [userID, id]
      );

    if (!resultCalDavEvents.length) {
      return null;
    }

    return resultCalDavEvents[0];
  };

  public static getEventByExternalID = async (userID: string, id: string) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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
        AND e.external_id = $2
  `,
        [userID, id]
      );

    if (!resultCalDavEvents.length) {
      return null;
    }

    return resultCalDavEvents[0];
  };

  public static getRepeatedEvents = async (
    userID: string,
    showTasks: boolean
  ) => {
    const repeatedEvents: CalDavEventsRaw[] =
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
        AND e.type = ANY ($2)
  `,
        [userID, getComponentsCondition(showTasks)]
      );

    return repeatedEvents;
  };

  public static getPublicRepeatedEvents = async (
    calDavCalendarIDs: string[],
    showTasks: boolean
  ) => {
    const repeatedEvents: CalDavEventsRaw[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT 
        ${CalDavEventRepository.calDavEventRawProps}
      FROM 
        caldav_events e
        INNER JOIN caldav_calendars c ON c.id = e.caldav_calendar_id
      WHERE 
        c.id = ANY($1)
        AND e.is_repeated = TRUE
        AND e.type = ANY ($2)
  `,
        [calDavCalendarIDs, getComponentsCondition(showTasks)]
      );

    return repeatedEvents;
  };

  public static getCalDavEventByID = async (
    userID: string,
    id: string
  ): Promise<CalDavEventsRaw> => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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

    return getOneResult(resultCalDavEvents);
  };

  public static getCalDavEventsByCalendarUrl = async (calendarUrl: string) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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

    return resultCalDavEvents;
  };

  public static getCalDavEventsByIDForSync = async (
    userID: string,
    syncDate: string
  ) => {
    const resultCalDavEvents: CalDavEventsRaw[] =
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

    return resultCalDavEvents;
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

    return existingEvent;
  };
}
