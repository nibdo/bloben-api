import { Request, Response } from 'express';

import { DateTime } from 'luxon';
import { EventResult } from '../../../bloben-interface/event/event';
import { forEach, map } from 'lodash';
import { formatEventRawToResult } from '../../../utils/format';
import { getRepeatedEvents } from '../../calDavEvent/helpers/repeatHelper';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import LuxonHelper from '../../../utils/luxonHelper';

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
  const { rangeFrom, rangeTo } = req.query as any;

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

  const repeatedEvents = await CalDavEventRepository.getRepeatedEvents(userID);
  let repeatedEventsResult = [];

  forEach(repeatedEvents, (event) => {
    const repeatedEvents = getRepeatedEvents(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

    repeatedEventsResult = [...repeatedEventsResult, ...repeatedEvents];
  });
  const calDavEventsNormal = map(normalEvents, (event) =>
    formatEventRawToResult(event)
  );
  const calDavEventsRepeated = map(repeatedEventsResult, (event) =>
    formatEventRawToResult(event)
  );

  const webCalEvents = await getWebcalEvents(userID, rangeFrom, rangeTo);

  result = [...calDavEventsNormal, ...calDavEventsRepeated, ...webCalEvents];

  // await CalDavCacheService.set(userID, { rangeFrom, rangeTo }, result);
  // }

  return result;
};
