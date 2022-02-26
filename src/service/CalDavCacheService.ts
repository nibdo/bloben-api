import {} from '../api/event/handlers/getEventsInRange';

import { DAVCalendarObject } from 'tsdav';
import { DateTime } from 'luxon';
import { Range } from '../bloben-interface/interface';
import { createDavClient } from './davService';
import { createEventsFromCalendarObject } from '../utils/davHelper';
import { forEach } from 'lodash';
import { redisClient } from '../index';

export class CalDavCacheService {
  static createRangeKey(range: Range) {
    return `${range.rangeFrom}_${range.rangeTo}`;
  }

  static async set(userID: string, range: Range, data: any) {
    const key = `${userID}_${this.createRangeKey(range)}`;

    await redisClient.set(key, JSON.stringify(data), 'PX', 500000);

    // get all user keys
    const userKeys = await redisClient.get(userID);
    let userParsedKeys: string[] = [];
    if (userKeys) {
      userParsedKeys = JSON.parse(userKeys);
    }

    // add current key
    userParsedKeys.push(key);

    await redisClient.set(userID, JSON.stringify(userParsedKeys), 'PX', 500000);
  }

  static async deleteByUserID(userID: string) {
    if (!redisClient) {
      return;
    }

    // get all user keys
    const userKeys = await redisClient.get(userID);
    if (userKeys) {
      const userParsedKeys: string[] = JSON.parse(userKeys);

      const promises: any = [];

      forEach(userParsedKeys, (key) => {
        promises.push(redisClient.del(key));
      });

      await Promise.all(promises);
    }

    await redisClient.del(userID);
  }

  static async get(userID: string, range: Range) {
    const resultRaw = await redisClient.get(
      `${userID}_${this.createRangeKey(range)}`
    );

    if (resultRaw) {
      return JSON.parse(resultRaw);
    } else {
      return null;
    }
  }

  static async fetchNewCacheData(
    userID: string,
    calDavAccounts: any,
    range: Range
  ) {
    let resultCalDavEvents: any = [];

    const rangeFrom = DateTime.fromISO(range.rangeFrom).toUTC().toString();
    const rangeTo = DateTime.fromISO(range.rangeTo).toUTC().toString();

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

    return resultCalDavEvents;
  }
}
