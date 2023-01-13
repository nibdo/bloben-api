import { Request, Response } from 'express';

import { CalDavTaskSettings } from 'bloben-interface';

import CalDavTaskSettingsRepository from '../../../../data/repository/CalDavTaskSettingsRepository';

export const getCalDavTaskSettings = async (
  req: Request,
  res: Response
): Promise<CalDavTaskSettings[]> => {
  const { userID } = res.locals;

  const result: CalDavTaskSettings[] =
    await CalDavTaskSettingsRepository.getRepository().query(
      `
      SELECT
        s.id as "id",
        s."order" as "order",
        s.order_by as "orderBy",
        s.caldav_calendar_id as "calendarID"
      FROM
        caldav_task_settings s
      INNER JOIN caldav_calendars c ON s.caldav_calendar_id = c.id
      INNER JOIN caldav_accounts ca ON ca.id = c.caldav_account_id
      WHERE
        ca.user_id = $1
        AND s.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
    `,
      [userID]
    );

  return result;
};
