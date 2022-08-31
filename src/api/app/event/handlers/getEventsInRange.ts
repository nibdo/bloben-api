import { Request, Response } from 'express';

import { DateTime } from 'luxon';
import { EventResult } from '../../../../bloben-interface/event/event';
import { formatEventRawToResult } from '../../../../utils/format';
import { getRepeatedEvents } from '../helpers/getRepeatedEvents';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
import { map } from 'lodash';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import LuxonHelper from '../../../../utils/luxonHelper';

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
export const getEventsInRange = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const { userID } = res.locals;
  const { rangeFrom, rangeTo, isDark } = req.query as unknown as Query;

  let result: EventResult[] = [];

  // try to get events from cache
  // const cacheResult = await CalDavCacheService.get(userID, {
  //   rangeFrom,
  //   rangeTo,
  // });

  // if (cacheResult) {
  //   return cacheResult;
  // } else {
  const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeFrom as string
  );
  const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeTo as string
  );

  const normalEvents = await CalDavEventRepository.getEventsInRange(
    userID,
    rangeFrom,
    rangeTo
  );

  const repeatedEvents = await getRepeatedEvents(
    userID,
    rangeFromDateTime,
    rangeToDateTime
  );

  const calDavEventsNormal = map(normalEvents, (event) =>
    formatEventRawToResult(event, isDark === 'true')
  );
  const calDavEventsRepeated = map(repeatedEvents, (event) =>
    formatEventRawToResult(event, isDark === 'true')
  );

  const webCalEvents = await getWebcalEvents(
    userID,
    rangeFrom,
    rangeTo,
    isDark === 'true'
  );

  result = [...calDavEventsNormal, ...calDavEventsRepeated, ...webCalEvents];

  return result;
};
