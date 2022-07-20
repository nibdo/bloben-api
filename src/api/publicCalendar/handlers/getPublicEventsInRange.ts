import { NextFunction, Request, Response } from 'express';

import { DateTime } from 'luxon';
import { EventResult } from '../../../bloben-interface/event/event';
import { REDIS_PREFIX } from '../../../utils/enums';
import { formatEventRawToResult } from '../../../utils/format';
import { getRepeatedEvents } from '../../event/helpers/getRepeatedEvents';
import { getSharedWebcalEvents } from '../../event/helpers/getWebCalEvents';
import { map } from 'lodash';
import { redisClient } from '../../../index';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import LuxonHelper from '../../../utils/luxonHelper';
import SharedLinkRepository from '../../../data/repository/SharedLinkRepository';

interface Query {
  rangeFrom: string;
  rangeTo: string;
  isDark: string;
}

/**
 * Get events outside base range
 * @param req
 * @param res
 */
export const getPublicEventsInRange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> => {
  try {
    const { sharedLink } = res.locals;
    const { rangeFrom, rangeTo, isDark } = req.query as unknown as Query;

    const cacheResponse = await redisClient.get(
      `${REDIS_PREFIX.PUBLIC_EVENTS_CACHE}_${sharedLink.id}_${rangeFrom}_${rangeTo}`
    );

    if (cacheResponse) {
      return res.json(JSON.parse(cacheResponse));
    }

    let response: EventResult[] = [];

    const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
      rangeFrom as string
    );
    const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
      rangeTo as string
    );

    const sharedCalDavCalendars =
      await SharedLinkRepository.getCalDavSharedCalendars(sharedLink.id);
    const sharedCalDavCalendarIDs = map(sharedCalDavCalendars, 'id');

    const sharedWebcalCalendars =
      await SharedLinkRepository.getWebcalSharedCalendars(sharedLink.id);
    const sharedWebcalCalendarIDs = map(sharedWebcalCalendars, 'id');

    const normalEvents = await CalDavEventRepository.getPublicEventsInRange(
      sharedCalDavCalendarIDs,
      rangeFrom,
      rangeTo
    );

    const repeatedEvents = await getRepeatedEvents(
      null,
      rangeFromDateTime,
      rangeToDateTime,
      sharedCalDavCalendarIDs
    );

    const calDavEventsNormal = map(normalEvents, (event) =>
      formatEventRawToResult(event, isDark === 'true')
    );
    const calDavEventsRepeated = map(repeatedEvents, (event) =>
      formatEventRawToResult(event, isDark === 'true')
    );

    const webCalEvents = await getSharedWebcalEvents(
      sharedWebcalCalendarIDs,
      rangeFrom,
      rangeTo,
      isDark === 'true'
    );

    response = [
      ...calDavEventsNormal,
      ...calDavEventsRepeated,
      ...webCalEvents,
    ];

    await redisClient.set(
      `${REDIS_PREFIX.PUBLIC_EVENTS_CACHE}_${sharedLink.id}_${rangeFrom}_${rangeTo}`,
      JSON.stringify(response),
      'EX',
      60 * 2
    );

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
