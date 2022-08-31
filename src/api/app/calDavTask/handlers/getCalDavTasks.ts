import { CalDavTask } from '../../../../bloben-interface/calDavTask/calDavTask';
import { Request, Response } from 'express';
import CalDavTaskRepository from '../../../../data/repository/CalDavTaskRepository';

export const getCalDavTasks = async (
  req: Request,
  res: Response
): Promise<CalDavTask[]> => {
  const { userID } = res.locals;

  const todos: CalDavTask[] = await CalDavTaskRepository.getRepository().query(
    `
      SELECT 
        t.id as "id",
        t.start_at as "startAt",
        t.end_at as "endAt",
        t.timezone_start_at as "timezoneStartAt",
        t.summary as "summary",
        t.location as "location",
        t.description as "description",
        t.all_day as "allDay",
        t.status as "status",
        t.is_repeated as "isRepeated",
        t.r_rule as "rRule",
        t.external_id as "externalID",
        t.etag as "etag",
        t.href as "href",
        t.status as "status",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        c.color as "color",
        c.id as "calendarID"
      FROM
        caldav_tasks t
      INNER JOIN
        caldav_calendars c ON c.id = t.caldav_calendar_id
      INNER JOIN
        caldav_accounts ca ON ca.id = c.caldav_account_id
      WHERE
        t.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ca.user_id = $1
      `,
    [userID]
  );

  return todos;
};
