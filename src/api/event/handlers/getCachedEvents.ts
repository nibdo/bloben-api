import { Request, Response } from 'express';
import { addRepeatedEvents } from '../../../utils/eventRepeatHelper';
import { formatEventRawToResult } from '../../../utils/format';
import { getCurrentRangeForSync } from '../../../utils/common';
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
): Promise<any> => {
  const { userID } = res.locals;

  const resultCalDavEvents = await CalDavEventRepository.getCalDavEventsByID(
    userID
  );

  let result = [];

  const range = getCurrentRangeForSync();

  result = addRepeatedEvents(resultCalDavEvents, range);

  return map(result, (event) => formatEventRawToResult(event));
};
