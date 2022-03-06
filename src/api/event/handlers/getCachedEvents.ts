import { EventResult } from '../../../bloben-interface/event/event';
import { Request, Response } from 'express';
import { addRepeatedEvents } from '../../../utils/eventRepeatHelper';
import { formatEventRawToResult } from '../../../utils/format';
import { getCurrentRangeForSync } from '../../../utils/common';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
import { map } from 'lodash';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';

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

  const resultCalDavEvents = await CalDavEventRepository.getCalDavEventsByID(
    userID
  );

  let result = [];

  const range = getCurrentRangeForSync();

  result = addRepeatedEvents(resultCalDavEvents, range);

  const calDavEvents = map(result, (event) => formatEventRawToResult(event));

  const webCalEvents = await getWebcalEvents(
    userID,
    range.rangeFrom,
    range.rangeTo
  );

  return [...calDavEvents, ...webCalEvents];
};
