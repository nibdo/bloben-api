import { DateTime } from 'luxon';
import { forEach } from 'lodash';
import { getRepeatedEvents } from '../api/calDavEvent/helpers/repeatHelper';

export const addRepeatedEvents = (data: any, range: any) => {
  let result: any = [];

  forEach(data, (item) => {
    if (item.isRepeated) {
      const repeatedEvents = getRepeatedEvents(
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
