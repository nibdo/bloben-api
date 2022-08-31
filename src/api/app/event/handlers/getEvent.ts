import { EVENT_TYPE } from '../../../../bloben-interface/enums';
import { EventResult } from '../../../../bloben-interface/event/event';
import { Request, Response } from 'express';
import { formatEventRawToResult } from '../../../../utils/format';
import { getWebcalEventByID } from '../helpers/getWebCalEvents';
import { throwError } from '../../../../utils/errorCodes';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

/**
 * Get events for initial view
 * @param req
 * @param res
 */
export const getEvent = async (
  req: Request,
  res: Response
): Promise<EventResult> => {
  const { userID } = res.locals;
  const { id } = req.params;
  const { type, isDark } = req.query;

  let result: EventResult | null = null;

  if (type === EVENT_TYPE.CALDAV) {
    const eventRaw = await CalDavEventRepository.getEventByID(userID, id);

    if (eventRaw) {
      result = formatEventRawToResult(eventRaw, isDark === 'true');
    }
  } else if (type === EVENT_TYPE.WEBCAL) {
    result = await getWebcalEventByID(userID, id);
  }

  if (!result) {
    throw throwError(404, 'Event not found');
  }

  return result;
};
