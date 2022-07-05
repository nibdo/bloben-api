import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavEventEntity from '../entity/CalDavEventEntity';

export interface CalDavEventsRaw {
  id: string;
  externalID: string;
  internalID?: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
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
  recurrenceID: any[];
  createdAt: string;
  updatedAt: string;
}

@EntityRepository(CalDavEventEntity)
export default class CalDavEventRepository extends Repository<CalDavEventEntity> {
  private static calDavEventRawProps = `
        e.id as "id",
        e.start_at as "startAt",
        e.end_at as "endAt",
        e.timezone_start_at as "timezoneStartAt",
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
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND c.is_hidden IS FALSE
        AND e.is_repeated = FALSE
        AND (e.start_at, e.end_at) OVERLAPS (CAST($2 AS timestamp), CAST($3 AS timestamp))
  `,
        [userID, rangeFrom, rangeTo]
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

  public static getRepeatedEvents = async (userID: string) => {
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
  `,
        [userID]
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
}
