import { DateTime } from 'luxon';
import { forEach } from 'lodash';
import { getOccurrences } from '../api/app/event/helpers/getRepeatedEvents';

export const addRepeatedEvents = (data: any, range: any) => {
  let result: any = [];

  forEach(data, (item) => {
    if (item.isRepeated) {
      const repeatedEvents = getOccurrences(
        item,
        DateTime.fromISO(range.rangeFrom),
        DateTime.fromISO(range.rangeTo)
      );

      result = [...result, ...repeatedEvents];
    } else {
      result = [...result, item];
    }
  });

  return result;
};
