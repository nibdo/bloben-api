import { CalDavTask, EVENT_TYPE } from 'bloben-interface';
import { Request, Response } from 'express';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { map } from 'lodash';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

interface GetCalDavTasksResponse {
  todos: CalDavTask[];
  pagination: {
    page: any;
    limit: any;
    total: number;
  };
}
export const getCalDavTasks = async (
  req: Request,
  res: Response
): Promise<GetCalDavTasksResponse> => {
  const { userID } = res.locals;
  const { calendarID, page, limit } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const calendar = await CalDavCalendarRepository.getByID(
    calendarID as string,
    userID
  );

  if (!calendar) {
    throw throwError(404, 'Calendar not found');
  }

  const todos: CalDavTask[] = await CalDavEventRepository.getRepository().query(
    `
      SELECT 
        e.id as "id",
        e.type as type,
        e.start_at as "startAt",
        e.end_at as "endAt",
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
        AND c.id = $2
        AND e.type = $5
      ORDER BY
        e.external_created_at DESC,
        e.created_at DESC,
        e.summary ASC
      LIMIT $3
      OFFSET $4
      `,
    [userID, calendarID, limit, offset, EVENT_TYPE.TASK]
  );

  const count: { count: number } =
    await CalDavEventRepository.getRepository().query(
      `
      SELECT
        COUNT(DISTINCT e.id) as count
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
        AND c.id = $2
        AND e.type = $3
    `,
      [userID, calendarID, EVENT_TYPE.TASK]
    );

  return {
    todos: map(todos, (todo) => ({
      ...todo,
      sourceType: SOURCE_TYPE.CALDAV,
    })),
    pagination: {
      page,
      limit,
      total: count?.[0]?.count,
    },
  };
};
