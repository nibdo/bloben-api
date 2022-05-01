import { DateTime } from 'luxon';
import { EventResult } from '../../../bloben-interface/event/event';
import { Request, Response } from 'express';
import { formatEventRawToResult } from '../../../utils/format';
import { getCurrentRangeForSync } from '../../../utils/common';
import { getRepeatedEvents } from '../helpers/getRepeatedEvents';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
import { map } from 'lodash';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import LuxonHelper from '../../../utils/luxonHelper';

/**
 * Get events for initial view
 * @param req
 * @param res
 */
export const getCachedEvents = async (
  req: Request,
  res: Response
): Promise<EventResult[]> => {
  const { userID } = res.locals;

  const { rangeFrom, rangeTo } = getCurrentRangeForSync();

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
    formatEventRawToResult(event)
  );
  const calDavEventsRepeated = map(repeatedEvents, (event) =>
    formatEventRawToResult(event)
  );

  const webCalEvents = await getWebcalEvents(userID, rangeFrom, rangeTo);

  return [...calDavEventsNormal, ...calDavEventsRepeated, ...webCalEvents];
};
