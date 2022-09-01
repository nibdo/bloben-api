import { EVENT_TYPE } from '../../../../data/types/enums';
import { NextFunction, Request, Response } from 'express';
import { SearchEventsResponse } from 'bloben-interface';
import { SearchResult } from '../../../app/event/handlers/searchEvents';
import { map } from 'lodash';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import SharedLinkRepository from '../../../../data/repository/SharedLinkRepository';
import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

export const searchPublicEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { summary } = req.query;
    const { sharedLink } = res.locals;

    const sharedCalDavCalendars =
      await SharedLinkRepository.getCalDavSharedCalendars(sharedLink.id);
    const sharedCalDavCalendarIDs = map(sharedCalDavCalendars, 'id');

    const sharedWebcalCalendars =
      await SharedLinkRepository.getWebcalSharedCalendars(sharedLink.id);
    const sharedWebcalCalendarIDs = map(sharedWebcalCalendars, 'id');

    const calDavResultPromise = CalDavEventRepository.getRepository().query(
      `
    SELECT
        ce.id as id,
        ce.summary as summary,
        ce.start_at as "startAt",
        ce.end_at as "endAt",
        ce."timezone_start_at" as "timezoneStartAt"
    FROM
        caldav_events ce
    INNER JOIN caldav_calendars cc ON ce.caldav_calendar_id = cc.id
    WHERE
        cc.deleted_at IS NULL
        AND cc.id = ANY($1)
        AND ce.summary ILIKE $2
    ORDER BY ce.start_at DESC
    LIMIT 50    
  `,
      [sharedCalDavCalendarIDs, `%${summary}%`]
    );

    const webcalResultPromise = WebcalEventRepository.getRepository().query(
      `
    SELECT
        DISTINCT we.external_id,
        we.id as id,
        we.summary as summary,
        we.start_at as "startAt",
        we.end_at as "endAt",
        we."timezone_start_at" as "timezoneStartAt"
    FROM
        webcal_events we
    INNER JOIN webcal_calendars wc ON we.external_calendar_id = wc.id
    WHERE
        we.deleted_at IS NULL
        AND wc.deleted_at IS NULL
        AND wc.id = ANY($1)
        AND we.summary ILIKE $2
    ORDER BY we.start_at DESC
    LIMIT 50
  `,
      [sharedWebcalCalendarIDs, `%${summary}%`]
    );

    const [calDavResult, webcalResult]: SearchResult[][] = await Promise.all([
      calDavResultPromise,
      webcalResultPromise,
    ]);

    const caldavResultFormatted = map(calDavResult, (item) => ({
      ...item,
      type: EVENT_TYPE.CALDAV,
    }));

    const webcalResultFormatted = map(webcalResult, (item) => ({
      id: item.id,
      summary: item.summary,
      startAt: item.startAt,
      endAt: item.endAt,
      timezoneStartAt: item.timezoneStartAt || null,
      type: EVENT_TYPE.WEBCAL,
    }));

    const response: SearchEventsResponse[] = [
      ...caldavResultFormatted,
      ...webcalResultFormatted,
    ];

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
