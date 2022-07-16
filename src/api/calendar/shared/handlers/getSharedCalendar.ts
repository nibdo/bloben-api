import { NextFunction, Request, Response } from 'express';

import {
  GetSharedCalendarResponse,
  SharedCalendar,
} from '../../../../bloben-interface/calendar/shared/calendarShared';
import { forEach } from 'lodash';
import { throwError } from '../../../../utils/errorCodes';
import SharedLinkRepository from '../../../../data/repository/SharedLinkRepository';

interface SharedLinksRaw {
  id: string;
  name: string;
  password: string | null;
  calDavCalendarID: string | null;
  calDavCalendarName: string | null;
  webcalCalendarID: string | null;
  webcalCalendarName: string | null;
  expireAt: string | null;
}

export const getSharedCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { id } = req.params;

    const sharedLinksRaw: SharedLinksRaw[] =
      await SharedLinkRepository.getRepository().query(
        `
    SELECT
      s.id as id, 
      s.name as name,
      s.password as password,
      s.expire_at as "expireAt",
      c.id as "calDavCalendarID",
      c.display_name as "calDavCalendarName",
      wc.id as "webcalCalendarID",
      wc.name as "webcalCalendarName"
    FROM
        shared_links s
    INNER JOIN shared_link_calendars slc ON slc.shared_link_id = s.id
    LEFT JOIN caldav_calendars c ON c.id = slc.caldav_calendar_id
    LEFT JOIN webcal_calendars wc ON wc.id = slc.webcal_calendar_id
    WHERE
        s.user_id = $1
        AND s.id = $2
        AND s.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND wc.deleted_at IS NULL
  `,
        [userID, id]
      );

    const webcalCalendars: SharedCalendar[] = [];
    const calDavCalendars: SharedCalendar[] = [];

    // map to result
    forEach(sharedLinksRaw, (item) => {
      if (item.calDavCalendarID) {
        calDavCalendars.push({
          id: item.calDavCalendarID,
          name: item.calDavCalendarName,
        });
      } else if (item.webcalCalendarID) {
        webcalCalendars.push({
          id: item.webcalCalendarID,
          name: item.webcalCalendarName,
        });
      }
    });

    if (!sharedLinksRaw.length) {
      throw throwError(404, 'Shared link not found');
    }

    const sharedLink = sharedLinksRaw[0];

    const response: GetSharedCalendarResponse = {
      id: sharedLink.id,
      name: sharedLink.name,
      password: sharedLink.password,
      expireAt: sharedLink.expireAt,
      webcalCalendars,
      calDavCalendars,
    };

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
