import { DateTime } from 'luxon';
//
// Support for local datetime, timezones and floating times
//
const FLOATING_DATETIME = 'floating'; // fixed datetime without timezone
const UTC_TIMEZONE = 'UTC';

export const TIMESTAMP_FORMAT = "yyyy-MM-dd HH:mm:ss 'Z'";
export const DATE_HOUR_FORMAT = 'd. MMM, HH:mm';
export const DATE_FORMAT = 'd. MMMM';
export const TIME_FORMAT = 'HH:mm';
export const DATE_DAY_FORMAT = 'd. MMMM (EEEEEE)';
export const WEEK_DAY_FORMAT = 'cccc';
export const WEEK_DAY_FORMAT_MEDIUM = 'ccc';
export const WEEK_DAY_FORMAT_SHORT = 'EEEEEE';
export const DATE_MONTH_YEAR_FORMAT = 'd. MMMM yyyy';

/**
 * Parse datetime according different rules like local datetime, floating time and timezones
 * @param date
 * @param zone
 * @param deviceTimezone
 * @constructor
 */
export const DatetimeParser = (
  date: DateTime | string,
  zone: string,
  deviceTimezone?: string
): string => {
  const dateString: string = typeof date === 'string' ? date : date.toString();

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    const dateFloating: DateTime = DateTime.fromISO(dateString, {
      zone: UTC_TIMEZONE,
    });

    return dateFloating.toUTC().toISO();
  }

  const thisDate: DateTime = DateTime.fromISO(dateString);

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    const dateConvert: DateTime = thisDate.setZone(zone);

    return dateConvert.setZone(deviceTimezone).toString();
  }

  return thisDate.setZone(zone).toString();
};

const LuxonHelper = {
  parseToDateTime: (date: string | DateTime): DateTime =>
    typeof date === 'string' ? DateTime.fromISO(date) : date,

  getLastDayOfMonth: (date: DateTime): DateTime => {
    const daysInMonth: number = date.daysInMonth;

    return date.set({ day: daysInMonth });
  },

  addMinutes: (date: string, minutes: number): DateTime => {
    return DateTime.fromISO(date).plus({ minutes });
  },

  subtractFromDate: (
    baseDate: Date,
    timezone: string,
    amount: number,
    timeUnit: string,
    isFloatingDate: boolean
  ): Date => {
    let dateConverted: DateTime = null;

    if (isFloatingDate) {
      dateConverted = DateTime.fromJSDate(baseDate);
    } else {
      dateConverted = DateTime.fromJSDate(baseDate).setZone(timezone);
    }

    const durationObj = {};
    durationObj[timeUnit] = amount;

    return dateConverted.minus(durationObj).toJSDate();
  },

  getDiffInMinutes: (dateA: Date, dateB: Date) => {
    const dateADateTime: DateTime = DateTime.fromJSDate(dateA);
    const dateBDateTime: DateTime = DateTime.fromJSDate(dateB);

    return dateBDateTime.diff(dateADateTime, 'minutes').minutes;
  },
  getDiffInMinutes2: (dateA: string, dateB: string) => {
    const dateADateTime: DateTime = DateTime.fromISO(dateA);
    const dateBDateTime: DateTime = DateTime.fromISO(dateB);

    return dateBDateTime.diff(dateADateTime, 'minutes').minutes;
  },

  getFirstDayOfMonth: (date: DateTime): DateTime => date.set({ day: 1 }),

  isSameDay: (dateA: DateTime | string, dateB: DateTime | string): boolean => {
    const dateAParsed: DateTime = LuxonHelper.parseToDateTime(dateA);
    const dateBParsed: DateTime = LuxonHelper.parseToDateTime(dateB);

    return (
      dateAParsed.year === dateBParsed.year &&
      dateAParsed.month === dateBParsed.month &&
      dateAParsed.day === dateBParsed.day
    );
  },

  isBefore: (dateA: string, dateB: string): boolean =>
    DateTime.fromISO(dateB).valueOf() - DateTime.fromISO(dateA).valueOf() > 0,

  isBeforeInDateTime: (dateA: DateTime, dateB: DateTime): boolean =>
    dateB.valueOf() - dateA.valueOf() > 0,

  isBeforeAny: (dateA: string, dateB: string): boolean => {
    const dateADateTime: DateTime = LuxonHelper.parseToDateTime(dateA);
    const dateBDateTime: DateTime = LuxonHelper.parseToDateTime(dateB);

    return dateBDateTime.valueOf() - dateADateTime.valueOf() > 0;
  },

  isToday: (dateA: DateTime): boolean => {
    const todayDate: DateTime = DateTime.local();

    return (
      dateA.day === todayDate.day &&
      dateA.month === todayDate.month &&
      dateA.year === todayDate.year
    );
  },

  parseToString: (date: DateTime | string): string => {
    if (typeof date !== 'string') {
      if (date.isValid) {
        return date.toUTC().toString();
      }
    }

    return date.toString() as string;
  },
  toUtcString: (date: string): string => DateTime.fromISO(date).toUTC().toISO(),
  toUtc: (date: DateTime): string => date.toUTC().toISO(),
  setTimezone: (dateString: string, timezone: string): string =>
    DateTime.fromISO(dateString).setZone(timezone).toString(),
  toHumanDate: (dateString: string): string =>
    DateTime.fromISO(dateString).toFormat('d LLL yyyy hh:mm'),
  toHumanDate2: (dateString: string): string =>
    DateTime.fromISO(dateString).toFormat('d LLL hh:mm'),
};

export default LuxonHelper;

export const formatToIcalDateString = (date: string): string =>
  DateTime.fromISO(date).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");

// export const formatDateInDateTimeObject = (item: DateTimeObject) => {
//   const dateFormatted = date.setZone('Europe/Berlin')
//
//   return {
//     startAt: `${dateFormatted.toFormat('yyyyMMdd')}T${dateFormatted.toFormat('HHmm')}00`,
//     endAt: `${dateFormatted.plus({ hour: 1 }).toFormat('yyyyMMdd')}T${date
//         .plus({ hour: 1 })
//         .toFormat('HHmm')}00`,
//   };
// };
