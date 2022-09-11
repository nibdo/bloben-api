import { CalDavEvent, CommonResponse, Range } from 'bloben-interface';
import { DateTime, Interval } from 'luxon';
import { SOCKET_APP_TYPE, SOCKET_CRUD_ACTION } from '../data/types/enums';
import { SOCKET_ROOM_NAMESPACE } from './enums';
import { WEEKDAY_START } from 'kalend/common/enums';
import { forEach } from 'lodash';
import { getMonthDays } from './calendarDays';
import { parseDurationString } from './caldavAlarmHelper';

export const createCommonResponse = (
  message = '',
  data?: any
): CommonResponse => {
  return {
    message,
    data,
  };
};

export const changeDtstartDate = (rRule: string, date: string) => {
  return (
    'DTSTART:' +
    formatIsoDateToRRuleDate(date) +
    '\n' +
    rRule.slice(rRule.indexOf('RRULE:'))
  );
};

export const formatToRRule = (rRule: string, date: string) => {
  const dateFormatted = formatIsoDateToRRuleDate(date);
  const rRuleParsed: string = parseUntilRRuleValue(rRule);
  return `DTSTART:${dateFormatted}\nRRULE:${rRuleParsed}`;
};

export const parseUntilRRuleValue = (rRule: string): string => {
  const indexOfUntil: number = rRule.indexOf('UNTIL=');

  if (indexOfUntil === -1) {
    return rRule;
  }

  const partBefore: string = rRule.slice(0, indexOfUntil);
  const partAfter: string = rRule.slice(partBefore.length);
  const delimiterIndex: number = partAfter.indexOf(';');
  const untilDatePart: string = formatIsoDateToRRuleDate(
    partAfter.slice('UNTIL='.length, delimiterIndex)
  );

  const restPart: string = partAfter.slice(delimiterIndex);

  const result = `${partBefore}UNTIL=${untilDatePart}${restPart}`;

  return result;
};

const formatIsoDateToRRuleDate = (date: string) => {
  let result = '';
  for (let i = 0; i < date.length; i++) {
    const letter: string = date[i];

    if (letter !== ':' && letter !== '-' && letter !== '.' && letter !== 'Z') {
      result += letter;
    }
  }

  if (result.length > 15) {
    return result.slice(0, 15);
  }

  return result;
};

export const createSocketCrudObj = (
  id: string,
  updatedAt: string,
  action: SOCKET_CRUD_ACTION,
  type: SOCKET_APP_TYPE
) => {
  return {
    id,
    updatedAt,
    action,
    type,
  };
};

export const createSocketCrudMsg = (
  id: string,
  updatedAt: string,
  action: SOCKET_CRUD_ACTION,
  type: SOCKET_APP_TYPE,
  data?: any,
  bulkData?: any
) => {
  return JSON.stringify({
    id,
    updatedAt,
    action,
    type,
    data: data ? data : null,
    bulkData: bulkData ? bulkData : null,
  });
};

export const createSocketCrudFull = (type: SOCKET_APP_TYPE, data: any) => {
  return JSON.stringify({
    id: 'null',
    updatedAt: 'null',
    action: SOCKET_CRUD_ACTION.FULL,
    type,
    data: JSON.stringify(data),
  });
};

export const generateRandomString = (length = 256) => {
  const charset =
    "0123456789abcdefghijklmnopqrstuvwxyz,./;']`=-<>?:|}{~_+()*&^%$#@!";
  let i = 0;
  let result = '';
  while (i < length) {
    result += charset.charAt(Math.random() * charset.length);
    i += 1;
  }

  return result;
};

export const generateRandomSimpleString = (length = 256) => {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
  let i = 0;
  let result = '';
  while (i < length) {
    result += charset.charAt(Math.random() * charset.length);
    i += 1;
  }

  return result;
};

export const getOneResult = (data: any) => {
  if (data.length > 0) {
    return data[0];
  }

  return null;
};

export const parseToDateTime = (
  date: DateTime | string,
  zone: string,
  deviceTimezone?: string
): DateTime => {
  const FLOATING_DATETIME = 'floating'; // fixed datetime without timezone
  const UTC_TIMEZONE = 'UTC';
  const dateString: string = typeof date === 'string' ? date : date.toString();

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    const dateFloating: DateTime = DateTime.fromISO(dateString, {
      zone: UTC_TIMEZONE,
    });

    return dateFloating.toUTC();
  }

  const thisDate: DateTime = DateTime.fromISO(dateString);

  let result;

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    result = thisDate.setZone(zone).setZone(deviceTimezone);
  } else {
    if (zone) {
      result = thisDate.setZone(zone);
    }
  }

  return result;
};

export const parseToDateTimeFromJsDate = (
  date: Date,
  zone: string,
  deviceTimezone?: string
): DateTime => {
  const FLOATING_DATETIME = 'floating'; // fixed datetime without timezone
  const UTC_TIMEZONE = 'UTC';

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    const dateFloating: DateTime = DateTime.fromJSDate(date, {
      zone: UTC_TIMEZONE,
    });

    return dateFloating.toUTC();
  }

  const thisDate: DateTime = DateTime.fromJSDate(date);

  let result;

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    result = thisDate.setZone(zone).setZone(deviceTimezone);
  } else {
    if (zone) {
      result = thisDate.setZone(zone);
    }
  }

  return result;
};

export const eventsToDateKey = (
  events: CalDavEvent[],
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const result: any = {};

  if (!events || events.length === 0) {
    return {};
  }

  events.forEach((item: any) => {
    const dateKey: any = parseToDateTime(
      item.startAt,
      item.timezoneStartAt || timezone
    ).toFormat('dd-MM-yyyy');

    if (result[dateKey]) {
      result[dateKey] = [...result[dateKey], ...[item]];
    } else {
      result[dateKey] = [item];
    }
  });

  return result;
};

export const checkOverlappingEventWithRange = (
  event: any,
  range: Range
): boolean => {
  const startAt: DateTime = DateTime.fromISO(event.startAt);
  const endAt: DateTime = DateTime.fromISO(event.endAt);
  const rangeStart: DateTime = DateTime.fromISO(range.rangeFrom);
  const rangeEnd: DateTime = DateTime.fromISO(range.rangeTo);

  return Interval.fromDateTimes(startAt, endAt).overlaps(
    Interval.fromDateTimes(rangeStart, rangeEnd)
  );
};

const normalizeDateStart = (date: DateTime) => {
  return date.set({ hour: 0, minute: 0, second: 0, millisecond: 1 });
};
const normalizeDateEnd = (date: DateTime) => {
  return date.set({ hour: 23, minute: 59, second: 59, millisecond: 59 });
};
export const getCurrentRangeForSync = () => {
  const calendarDays = getMonthDays(
    normalizeDateStart(DateTime.now()),
    undefined,
    WEEKDAY_START.MONDAY
  );

  return {
    rangeFrom: calendarDays[0].toUTC().toString(),
    rangeTo: normalizeDateEnd(
      calendarDays[calendarDays.length - 1].toUTC()
    ).toString(),
  };
};

export const getIdFromUrl = (url: string) => {
  let str = url;
  // remove last slash
  const hasEndingSlash = str.slice(url.length - 1, url.length) === '/';

  if (hasEndingSlash) {
    str = str.slice(0, -1);
  }

  const endingWithFileExtension = str.slice(-4, -3) === '.';

  if (endingWithFileExtension) {
    str = str.slice(0, -4);
  }

  const re = /([^/]*)$/g;
  const myArray = str.match(re);

  return myArray?.[0] || '';
};
//
// export const getDeletedCalendars = (
//   serverCalendars: DAVCalendar[],
//   localCalendars: CalDavCalendarEntity[],
//   account: CalDavAccount
// ): CalDavCalendarEntity[] => {
//   const result: CalDavCalendarEntity[] = [];
//   //
//   // forEach(localCalendars, localCalendar => {
//   //   let exists = false;
//   //
//   //   forEach(serverCalendars, serverCalendar => {
//   //     if (localCalendar.url === serverCalendar.url) {
//   //       exists = true;
//   //       return false;
//   //     } else {
//   //       if (localCalendar.principalUrl !== account.principalUrl) {
//   //         exists = true;
//   //         return false;
//   //       }
//   //     }
//   //   });
//   //
//   //   if (!exists) {
//   //     result.push(localCalendar);
//   //   }
//   // });
//
//   return result;
// };

export const getUserIDFromWsRoom = (id: string) => {
  const enumLength = SOCKET_ROOM_NAMESPACE.USER_ID.length;
  if (
    id.length <= enumLength ||
    id.slice(0, enumLength) !== SOCKET_ROOM_NAMESPACE.USER_ID
  ) {
    return null;
  }

  return id.slice(SOCKET_ROOM_NAMESPACE.USER_ID.length);
};

export const validateStringDate = (date: string) => {
  if (!date || date.length === 0) {
    throw Error('Empty event date');
  }

  const dateTime = DateTime.fromISO(date);

  if (!dateTime.isValid) {
    throw Error(`Cannot parse date ${date}`);
  }

  return true;
};

export const parseEventDuration = (startAt: string, duration: string) => {
  let durationString = '';
  let numberValue = '';
  forEach(duration, (letter: string) => {
    if (isNaN(Number(letter))) {
      durationString = parseDurationString(letter);
    } else {
      numberValue = `${numberValue}${letter}`;
    }
  });

  return DateTime.fromISO(startAt)
    .plus({
      [durationString]: Number(numberValue),
    })
    .toString();
};

export const removeArtifacts = (value: string, counter = 0): string => {
  if (counter > 30) {
    return value;
  }

  if (!value) {
    return null;
  }

  let newValue = value;

  const hasSlashN = value.indexOf('\n') !== -1;
  const hasSlashR = value.indexOf('\r') !== -1;

  if (hasSlashN) {
    newValue = newValue.replace('\n', '');
  }

  if (hasSlashR) {
    newValue = newValue.replace('\r', '');
  }

  return removeArtifacts(newValue, counter + 1);
};
