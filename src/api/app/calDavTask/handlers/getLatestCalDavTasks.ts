import { CalDavTask, EVENT_TYPE } from 'bloben-interface';
import { Request, Response } from 'express';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { map } from 'lodash';
import CalDavEventRepository, {
  formatSQLDateTime,
} from '../../../../data/repository/CalDavEventRepository';

export const getLatestCalDavTasks = async (
  req: Request,
  res: Response
): Promise<CalDavTask[]> => {
  const { userID } = res.locals;

  const todos: CalDavTask[] = await CalDavEventRepository.getRepository().query(
    `
      SELECT 
        e.id as "id",
        e.type as type,
        ${formatSQLDateTime('e.start_at')} as "startAt",
        ${formatSQLDateTime('e.end_at')} as "endAt",
        e.timezone_start_at as "timezoneStartAt",
        e.summary as "summary",
        e.description as "description",
        e.all_day as "allDay",
        e.status as "status",
        e.is_repeated as "isRepeated",
        e.r_rule as "rRule",
        e.external_id as "externalID",
        e.etag as "etag",
        e.href as "url",
        e.status as "status",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        c.color as "color",
        c.id as "calendarID"
      FROM
        caldav_events e
      INNER JOIN
        caldav_calendars c ON c.id = e.caldav_calendar_id
      INNER JOIN
        caldav_accounts ca ON ca.id = c.caldav_account_id
      WHERE
        c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ca.user_id = $1
        AND e.type = $2
      ORDER BY
        e.external_created_at DESC,
        e.created_at DESC,
        e.summary ASC
      LIMIT 20
      `,
    [userID, EVENT_TYPE.TASK]
  );

  return map(todos, (todo) => ({
    ...todo,
    sourceType: SOURCE_TYPE.CALDAV,
  }));
};
