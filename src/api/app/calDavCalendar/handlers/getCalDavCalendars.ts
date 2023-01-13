import { Request, Response } from 'express';

import { CalendarAlarms, GetCalDavCalendar } from 'bloben-interface';
import { map } from 'lodash';
import { parseToJSON } from '../../../../utils/common';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';

export const formatCalendarResponse = (
  calendar: CalendarRaw,
  calDavAccount?: any
): GetCalDavCalendar => {
  return {
    id: calendar.id,
    displayName: calendar.customDisplayName || calendar.displayName,
    url: calendar.url,
    isHidden: calendar.isHidden,
    components: parseToJSON(calendar.components),
    color: calendar.customColor || calendar.color || null,
    timezone: calendar.timezone || null,
    alarms: parseToJSON(calendar.alarms) || [],
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
  alarms: CalendarAlarms[];
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
        c.is_hidden as "isHidden",
        c.alarms as "alarms"
      FROM 
        caldav_calendars c
        JOIN caldav_accounts ca ON ca.id = c.caldav_account_id AND ca.deleted_at IS NULL
      WHERE
        ca.user_id = $1
        AND c.deleted_at IS NULL
        AND ca.account_type = 'caldav'
        ${component ? 'AND $2 IN (c.components)' : ''};
    `,
      parameters
    );

  return map(calendarsRaw, (calendar) => formatCalendarResponse(calendar));
};
