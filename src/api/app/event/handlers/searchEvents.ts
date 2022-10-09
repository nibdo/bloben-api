import { EVENT_TYPE } from 'bloben-interface/enums';
import { Request, Response } from 'express';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { SearchEventsResponse } from 'bloben-interface';
import { map } from 'lodash';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

export interface SearchResult {
  id: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
}

export const searchEvents = async (
  req: Request,
  res: Response
): Promise<SearchEventsResponse[]> => {
  const { summary } = req.query;
  const { userID } = res.locals;

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
    INNER JOIN caldav_accounts ca ON ca.id = cc.caldav_account_id
    WHERE
        cc.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ca.user_id = $1
        AND ce.summary ILIKE $2
    ORDER BY ce.start_at DESC
    LIMIT 50    
  `,
    [userID, `%${summary}%`]
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
        AND wc.user_id = $1
        AND we.summary ILIKE $2
    ORDER BY we.start_at DESC
    LIMIT 50
  `,
    [userID, `%${summary}%`]
  );

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
    sourceType: SOURCE_TYPE.CALDAV,
    type: EVENT_TYPE.EVENT,
  }));

  return [...caldavResultFormatted, ...webcalResultFormatted];
};
