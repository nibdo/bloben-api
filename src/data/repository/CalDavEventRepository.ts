import { EntityRepository, Repository, getRepository } from 'typeorm';

import CalDavEventEntity from '../entity/CalDavEventEntity';

export interface CalDavEventsRaw {
  id: string;
  internalID: string;
  startAt: string;
  endAt: string;
  timezoneStart: string | null;
  summary: string;
  description: string;
  allDay?: boolean;
  location: string;
  rRule: string | null;
  isRepeated: boolean;
  etag: string;
  href: string;
  color: string;
  calendarID: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

@EntityRepository(CalDavEventEntity)
export default class CalDavEventRepository extends Repository<CalDavEventEntity> {
  private static calDavEventRawProps = `
        e.id as "internalID",
        e.start_at as "startAt",
        e.end_at as "endAt",
        e.timezone_start as "timezoneStart",
        e.summary as "summary",
        e.location as "location",
        e.description as "description",
        e.all_day as "allDay",
        e.is_repeated as "isRepeated",
        e.r_rule as "rRule",
        e.external_id as "id",
        e.etag as "etag",
        e.href as "href",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        e.deleted_at as "deletedAt",
        c.color as "color",
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
        AND e.deleted_at IS NULL
  `,
        [userID]
      );

    return resultCalDavEvents;
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
        AND e.deleted_at IS NULL
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
        AND (e.created_at > $2 OR e.updated_at > $2 OR e.deleted_at > $2)
  `,
        [userID, syncDate]
      );

    return resultCalDavEvents;
  };
}
