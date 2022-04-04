import { Request, Response } from 'express';

import { CalDavCacheService } from '../../../service/CalDavCacheService';
import { DAVCalendarObject } from 'tsdav';
import { EventResult } from '../../../bloben-interface/event/event';
import { createEventsFromCalendarObject } from '../../../utils/davHelper';
import { forEach } from 'lodash';
import { getWebcalEvents } from '../helpers/getWebCalEvents';
import { loginToCalDav } from '../../../service/davService';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';

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

  // get calDav accounts
  const calDavAccounts: any = await CalDavAccountRepository.getCalDavAccounts(
    userID,
    true
  );

  let resultCalDavEvents: EventResult[] = [];

  // try to get events from cache
  const cacheResult = await CalDavCacheService.get(userID, {
    rangeFrom,
    rangeTo,
  });

  if (cacheResult) {
    return cacheResult;
  } else {
    // check every calendar
    for (const calDavAccount of calDavAccounts) {
      const calDavCalendars = calDavAccount.calendars;

      const client = await loginToCalDav(calDavAccount);

      for (const calDavCalendar of calDavCalendars) {
        const params: any = {
          calendar: calDavCalendar,
          timeRange: {
            start: rangeFrom,
            end: rangeTo,
          },
        };

        const response: DAVCalendarObject[] = await client.fetchCalendarObjects(
          params
        );

        forEach(response, (item) => {
          if (item.data) {
            resultCalDavEvents = [
              ...resultCalDavEvents,
              ...createEventsFromCalendarObject(item, calDavCalendar, {
                rangeFrom,
                rangeTo,
              }),
            ];
          }
        });
      }
    }

    const webCalEvents = await getWebcalEvents(userID, rangeFrom, rangeTo);

    resultCalDavEvents = [...resultCalDavEvents, ...webCalEvents];

    await CalDavCacheService.set(
      userID,
      { rangeFrom, rangeTo },
      resultCalDavEvents
    );
  }

  return resultCalDavEvents;
};
