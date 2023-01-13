import { DateTime } from 'luxon';
import { EventResult } from 'bloben-interface';
import { formatEventRawToResult } from '../../../../utils/format';
import { getRepeatedEvents } from './getRepeatedEvents';
import { getWebcalEvents } from './getWebCalEvents';
import { map } from 'lodash';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import LuxonHelper from '../../../../utils/luxonHelper';

export const getRangeEventsFunc = async (
  userID: string,
  rangeFrom: string,
  rangeTo: string,
  showTasks: boolean,
  isDark: boolean
) => {
  let result: EventResult[] = [];

  const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeFrom as string
  );
  const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeTo as string
  );

  const promises: any[] = [
    CalDavEventRepository.getEventsInRange(
      userID,
      rangeFrom,
      rangeTo,
      showTasks
    ),
    getRepeatedEvents(
      userID,
      rangeFromDateTime,
      rangeToDateTime,
      undefined,
      showTasks
    ),
    getWebcalEvents(userID, rangeFrom, rangeTo, isDark),
  ];

  const [normalEvents, repeatedEvents, webCalEvents] = await Promise.all(
    promises
  );

  const calDavEventsNormal = map(normalEvents, (event) =>
    formatEventRawToResult(event, isDark)
  );
  const calDavEventsRepeated = map(repeatedEvents, (event) =>
    formatEventRawToResult(event, isDark)
  );

  // @ts-ignore
  result = [...calDavEventsNormal, ...calDavEventsRepeated, ...webCalEvents];

  return result;
};
