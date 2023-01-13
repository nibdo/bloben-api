import {} from '../api/app/event/handlers/getEventsInRange';

import { DAVCalendarObject } from 'tsdav';
import { DateTime } from 'luxon';
import { MemoryClient } from './init';
import { Range } from 'bloben-interface';
import { createDavClient } from './davService';
import { createEventsFromCalendarObject } from '../utils/davHelper';
import { forEach } from 'lodash';

export class CalDavCacheService {
  static createRangeKey(range: Range) {
    return `${range.rangeFrom}_${range.rangeTo}`;
  }

  static async set(userID: string, range: Range, data: any) {
    const key = `${userID}_${this.createRangeKey(range)}`;

    await MemoryClient.set(key, JSON.stringify(data), 'EX', 60 * 60 * 2);

    // get all user keys
    const userKeys = await MemoryClient.get(userID);
    let userParsedKeys: string[] = [];
    if (userKeys) {
      userParsedKeys = JSON.parse(userKeys);
    }

    // add current key
    userParsedKeys.push(key);

    await MemoryClient.set(
      userID,
      JSON.stringify(userParsedKeys),
      'EX',
      500000
    );
  }

  static async deleteByUserID(userID: string) {
    if (!MemoryClient) {
      return;
    }

    // get all user keys
    const userKeys = await MemoryClient.get(userID);
    if (userKeys) {
      const userParsedKeys: string[] = JSON.parse(userKeys);

      const promises: any = [];

      forEach(userParsedKeys, (key) => {
        promises.push(MemoryClient.del(key));
      });

      await Promise.all(promises);
    }

    await MemoryClient.del(userID);
  }

  static async get(userID: string, range: Range) {
    const resultRaw = await MemoryClient.get(
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
