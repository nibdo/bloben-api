import { NextFunction, Request, Response } from 'express';

import { GetCalDavCalendar } from 'bloben-interface';
import { MemoryClient } from '../../../../service/init';
import { REDIS_PREFIX } from '../../../../utils/enums';
import { map } from 'lodash';
import SharedLinkCalendarRepository from '../../../../data/repository/SharedLinkCalendarRepository';

export const formatCalendarResponse = (
  calendar: CalendarPublicRaw
): GetCalDavCalendar => {
  return {
    id: calendar.id,
    displayName: calendar.customDisplayName || calendar.displayName,
    url: '',
    isHidden: false,
    components: [],
    color: calendar.customColor || calendar.color || null,
    timezone: calendar.timezone || null,
    alarms: [],
    calDavAccountID: null,
  };
};

interface CalendarPublicRaw {
  id: string;
  displayName: string;
  customDisplayName: string | null;
  color: string;
  customColor: string | null;
  timezone: string;
}

export const getPublicCalendars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sharedLink } = res.locals;

    const cacheResponse = await MemoryClient.get(
      `${REDIS_PREFIX.PUBLIC_CALENDAR_CACHE}_${sharedLink.id}`
    );

    if (cacheResponse) {
      return res.json(JSON.parse(cacheResponse));
    }

    // get calendars
    const calDavCalendars: CalendarPublicRaw[] =
      await SharedLinkCalendarRepository.getRepository().query(
        `
    SELECT 
      c.id as id,
      c.display_name as "displayName",
      c.custom_display_name as "customDisplayName",
      c.timezone as timezone,
      c.color as color,
      c.custom_color as "customColor"
    FROM
        shared_link_calendars slc
    INNER JOIN caldav_calendars c ON c.id = slc.caldav_calendar_id
    WHERE
        slc.shared_link_id = $1
        AND c.deleted_at IS NULL
  `,
        [sharedLink.id]
      );

    const response = map(calDavCalendars, (calendar) =>
      formatCalendarResponse(calendar)
    );

    await MemoryClient.set(
      `${REDIS_PREFIX.PUBLIC_CALENDAR_CACHE}_${sharedLink.id}`,
      JSON.stringify(response),
      'EX',
      60 * 5
    );

    return res.json(response);
  } catch (err) {
    next(err);
  }
};
