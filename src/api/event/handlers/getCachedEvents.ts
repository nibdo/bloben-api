import { DateTime } from 'luxon';
import { EventResult } from '../../../bloben-interface/event/event';
import { Request, Response } from 'express';
import { forEach, map } from 'lodash';
import { formatEventRawToResult } from '../../../utils/format';
import { getCurrentRangeForSync } from '../../../utils/common';
import { getRepeatedEvents } from '../../calDavEvent/helpers/repeatHelper';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
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

  return [...calDavEventsNormal, ...calDavEventsRepeated, ...webCalEvents];
};
