/* tslint:disable:no-magic-numbers */
import { CALENDAR_VIEW, WEEKDAY_START } from 'kalend-layout';
import { DateTime } from 'luxon';
import LuxonHelper from './luxonHelper';

export const formatIsoStringDate = (stringDate: string) =>
  stringDate.slice(0, stringDate.indexOf('T'));

const calculateMondayStartWeekDay = (
  date: DateTime,
  calendarView: CALENDAR_VIEW
): DateTime[] => {
  const days = [];
  const dayInWeek = date.weekday;
  const startDate = date.minus({ days: dayInWeek - 1 });

  if (calendarView === CALENDAR_VIEW.MONTH) {
    // @ts-ignore
    if (dayInWeek === 0) {
      for (let i = 6; i > 0; i--) {
        days.push(date.minus({ days: i }));
      }
      days.push(date);
    } else {
      days.push(startDate);
      for (let i = 1; i < 7; i++) {
        days.push(startDate.plus({ days: i }));
      }
    }
  } else {
    for (let i = 0; i < 7; i++) {
      days.push(startDate.plus({ days: i }));
    }
  }

  return days;
};

const calculateSundayStartWeekDay = (
  date: DateTime,
  calendarView: CALENDAR_VIEW
): DateTime[] => {
  const days = [];
  const dayInWeek = date.weekday;
  const startDate =
    dayInWeek === 7
      ? date.plus({ days: dayInWeek - 7 })
      : date.minus({ days: dayInWeek });

  if (calendarView === CALENDAR_VIEW.MONTH) {
    if (dayInWeek === 7) {
      for (let i = 6; i > 0; i--) {
        days.push(date.minus({ days: i }));
      }
      days.push(date);
    } else {
      days.push(startDate);
      for (let i = 1; i < 7; i++) {
        days.push(startDate.plus({ days: i }));
      }
    }
  } else {
    for (let i = 0; i < 7; i++) {
      days.push(startDate.plus({ days: i }));
    }
  }

  return days;
};

export const getWeekDays = (
  date: DateTime,
  calendarView: CALENDAR_VIEW,
  weekDayStart: WEEKDAY_START,
  setSelectedDate?: any
): DateTime[] => {
  // Set state
  if (setSelectedDate && calendarView !== CALENDAR_VIEW.MONTH) {
    setSelectedDate(date);
  }

  if (weekDayStart === WEEKDAY_START.MONDAY) {
    return calculateMondayStartWeekDay(date, calendarView);
  } else {
    return calculateSundayStartWeekDay(date, calendarView);
  }
};

export const calculateMonthDays = (
  date: DateTime,
  weekDayStart: WEEKDAY_START
): DateTime[] => {
  const FIVE_WEEKS_DAYS_COUNT = 36;
  // Get reference date for calculating new month

  // Get first week of current month
  const firstDayOfCurrentMonth: DateTime = LuxonHelper.getFirstDayOfMonth(date);

  const firstWeekOfCurrentMonth: DateTime[] = getWeekDays(
    firstDayOfCurrentMonth,
    CALENDAR_VIEW.WEEK,
    weekDayStart,
    undefined
  );

  const monthDays: DateTime[] = firstWeekOfCurrentMonth;

  // Add missing days to month view
  for (let i = 1; i < FIVE_WEEKS_DAYS_COUNT; i += 1) {
    const day: DateTime = firstWeekOfCurrentMonth[6].plus({ days: i });
    monthDays.push(day);
  }

  return monthDays;
};

export const getMonthDays = (
  date: DateTime,
  setSelectedDate: any,
  weekDayStart: WEEKDAY_START
) => {
  const monthDays: DateTime[] = calculateMonthDays(date, weekDayStart);

  // Set state
  if (setSelectedDate) {
    setSelectedDate(monthDays[15]);
  }

  return monthDays;
};
