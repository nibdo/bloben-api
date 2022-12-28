import { EVENT_TYPE, SearchEventsResponse } from 'bloben-interface';
import { NextFunction, Request, Response } from 'express';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { SearchResult } from '../../../app/event/handlers/searchEvents';
import { createArrayQueryReplacement } from '../../../../utils/common';
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

    const calDavResultPromise = sharedCalDavCalendarIDs.length
      ? CalDavEventRepository.getRepository().query(
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
        AND ce.summary LIKE $1
        AND cc.id IN (${createArrayQueryReplacement(
          sharedCalDavCalendarIDs,
          2
        )})
    ORDER BY ce.start_at DESC
    LIMIT 50    
  `,
          [`%${summary}%`, ...sharedCalDavCalendarIDs]
        )
      : () => Promise.resolve();

    const webcalResultPromise = sharedWebcalCalendarIDs.length
      ? WebcalEventRepository.getRepository().query(
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
        AND we.summary LIKE $1
        AND wc.id IN (${createArrayQueryReplacement(
          sharedWebcalCalendarIDs,
          2
        )})
    ORDER BY we.start_at DESC
    LIMIT 50
  `,
          [`%${summary}%`, ...sharedWebcalCalendarIDs]
        )
      : () => Promise.resolve();

    const [calDavResult, webcalResult]: SearchResult[][] = await Promise.all([
      calDavResultPromise,
      webcalResultPromise,
    ]);

    const caldavResultFormatted = map(calDavResult, (item) => ({
      ...item,
      sourceType: SOURCE_TYPE.CALDAV,
      type: EVENT_TYPE.EVENT,
    }));

    const webcalResultFormatted = map(webcalResult, (item) => ({
      id: item.id,
      summary: item.summary,
      startAt: item.startAt,
      endAt: item.endAt,
      timezoneStartAt: item.timezoneStartAt || null,
      sourceType: SOURCE_TYPE.WEBCAL,
      type: EVENT_TYPE.EVENT,
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
