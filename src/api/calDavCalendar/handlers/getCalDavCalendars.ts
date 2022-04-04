import { Request, Response } from 'express';

import { GetCalDavCalendar } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { map } from 'lodash';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';

export const formatCalendarResponse = (
  calendar: CalendarRaw,
  calDavAccount?: any
): GetCalDavCalendar => {
  return {
    id: calendar.id,
    displayName: calendar.customDisplayName || calendar.displayName,
    url: calendar.url,
    isHidden: calendar.isHidden,
    components: calendar.components,
    color: calendar.customColor || calendar.color || null,
    timezone: calendar.timezone || null,
    calDavAccountID: calDavAccount
      ? calDavAccount.id
      : calendar.calDavAccountID,
  };
};

interface CalendarRaw {
  id: string;
  displayName: string;
  customDisplayName: string | null;
  color: string;
  customColor: string | null;
  url: string;
  components: string[];
  calDavAccountID: string;
  timezone: string;
  isHidden: boolean;
}

export const getCalDavCalendars = async (
  req: Request,
  res: Response
): Promise<GetCalDavCalendar[]> => {
  const { userID } = res.locals;
  const { component } = req.query;

  const parameters = component ? [userID, component] : [userID];

  const calendarsRaw: CalendarRaw[] =
    await CalDavCalendarRepository.getRepository().query(
      `
      SELECT 
        c.id as id, 
        c.display_name as "displayName", 
        c.custom_display_name as "customDisplayName", 
        c.color as color,
        c.custom_color as "customColor",
        c.url as url,
        c.components as components,
        c.caldav_account_id as "calDavAccountID",
        c.timezone as timezone,
        c.is_hidden as "isHidden"
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
