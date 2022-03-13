import { Request, Response } from 'express';

import { GetCalDavCalendar } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { map } from 'lodash';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';

export const formatCalendarResponse = (
  calendar: any,
  calDavAccount?: any
): GetCalDavCalendar => {
  return {
    id: calendar.id,
    displayName: calendar.displayName,
    url: calendar.url,
    components: calendar.components,
    color: calendar.color || null,
    timezone: calendar.timezone || null,
    calDavAccountID: calDavAccount
      ? calDavAccount.id
      : calendar.calDavAccountID,
  };
};

export const getCalDavCalendars = async (
  req: Request,
  res: Response
): Promise<GetCalDavCalendar[]> => {
  const { userID } = res.locals;
  const { component } = req.query;

  const parameters = component ? [userID, component] : [userID];

  const calendarsRaw: any =
    await CalDavCalendarRepository.getRepository().query(
      `
      SELECT 
        c.id as id, 
        c.display_name as "displayName", 
        c.color as color,
        c.url as url,
        c.components as components,
        c.caldav_account_id as "calDavAccountID",
        c.timezone as timezone
      FROM 
        caldav_calendars c
        JOIN caldav_accounts ca ON ca.id = c.caldav_account_id AND ca.deleted_at IS NULL
      WHERE
        ca.user_id = $1
        AND c.deleted_at IS NULL
        ${component ? 'AND $2 = ANY(c.components)' : ''};
    `,
      parameters
    );

  return map(calendarsRaw, (calendar) => formatCalendarResponse(calendar));
};
