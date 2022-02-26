import { Request, Response } from 'express';

import { CalDavCacheService } from '../../../service/CalDavCacheService';
import { CalDavEvent } from '../../../bloben-interface/interface';
import { DAVCalendarObject } from 'tsdav';
import { createDavClient } from '../../../service/davService';
import { createEventsFromCalendarObject } from '../../../utils/davHelper';
import { forEach } from 'lodash';
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
    userID
  );

  let resultCalDavEvents: CalDavEvent[] = [];

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

      const client = createDavClient(calDavAccount.url, {
        username: calDavAccount.username,
        password: calDavAccount.password,
      });
      await client.login();

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

    await CalDavCacheService.set(
      userID,
      { rangeFrom, rangeTo },
      resultCalDavEvents
    );
  }

  return resultCalDavEvents;
};
