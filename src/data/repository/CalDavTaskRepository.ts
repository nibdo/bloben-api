import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavTaskEntity from '../entity/CalDavTaskEntity';

export interface CalDavTaskRaw {
  id: string;
  externalID: string;
  internalID?: string;
  startAt: string;
  summary: string;
  status: string;
  props: any;
  description: string;
  allDay?: boolean;
  rRule: string | null;
  isRepeated: boolean;
  etag: string;
  href: string;
  color: string;
  customCalendarColor: string | null;
  calendarID: string;
  valarms: any[];
  recurrenceID: any[];
  createdAt: string;
  updatedAt: string;
}

@EntityRepository(CalDavTaskEntity)
export default class CalDavTaskRepository extends Repository<CalDavTaskEntity> {
  private static calDavTaskRawProps = `
        t.id as "id",
        t.start_at as "startAt",
        t.summary as "summary",
        t.description as "description",
        t.all_day as "allDay",
        t.status as "status",
        t.is_repeated as "isRepeated",
        t.r_rule as "rRule",
        t.external_id as "externalID",
        t.etag as "etag",
        t.href as "href",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        c.color as "color",
        c.custom_color as "customCalendarColor",
        c.id as "calendarID"
  `;

  public static getRepository() {
    return getRepository(CalDavTaskEntity);
  }

  public static async getByID(id: string, userID: string): Promise<any | null> {
    const result: any = await getRepository(CalDavTaskEntity).query(
      `
      SELECT 
        t.id
      FROM 
        caldav_tasks t
      INNER JOIN caldav_calendars c ON c.id = t.caldav_calendar_id
      INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
      WHERE
        t.id = $1
        AND a.user_id = $2
        AND t.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND a.deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static getTasksInRange = async (
    userID: string,
    rangeFrom: string,
    rangeTo: string
  ) => {
    const result: CalDavTaskRaw[] =
      await CalDavTaskRepository.getRepository().query(
        `
      SELECT 
        ${CalDavTaskRepository.calDavTaskRawProps}
      FROM 
        caldav_tasks t
        INNER JOIN caldav_calendars c on c.id = t.caldav_calendar_id
        INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        a.user_id = $1
        AND c.is_hidden IS FALSE
        AND t.is_repeated = FALSE
        AND t.start_at IS NOT NULL
        AND (t.start_at >= CAST($2 AS timestamp) AND t.start_at <= CAST($3 AS timestamp))
  `,
        [userID, rangeFrom, rangeTo]
      );

    return result;
  };
}
