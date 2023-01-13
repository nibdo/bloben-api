import { EVENT_TYPE, SearchEventsResponse } from 'bloben-interface';
import { Request, Response } from 'express';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { map } from 'lodash';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

export interface SearchResult {
  id: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  timezoneEndAt: string | null;
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
        ce."timezone_start_at" as "timezoneStartAt",
        ce."timezone_end_at" as "timezoneEndAt"
    FROM
        caldav_events ce
    INNER JOIN caldav_calendars cc ON ce.caldav_calendar_id = cc.id
    INNER JOIN caldav_accounts ca ON ca.id = cc.caldav_account_id
    WHERE
        cc.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ca.user_id = $1
        AND ce.summary LIKE $2
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
        we."timezone_start_at" as "timezoneStartAt",
        we."timezone_end_at" as "timezoneEndAt"
    FROM
        webcal_events we
    INNER JOIN webcal_calendars wc ON we.external_calendar_id = wc.id
    WHERE
        we.deleted_at IS NULL
        AND wc.deleted_at IS NULL
        AND wc.user_id = $1
        AND we.summary LIKE $2
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
    timezoneEndAt: item.timezoneEndAt || item.timezoneStartAt || null,
    sourceType: SOURCE_TYPE.CALDAV,
    type: EVENT_TYPE.EVENT,
  }));

  return [...caldavResultFormatted, ...webcalResultFormatted];
};
