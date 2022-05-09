import ICalParser from 'ical-js-parser-dev';

import { CalDavEventObj, formatIcalDate } from './davHelper';
import { DateTime } from 'luxon';
import { forEach, map } from 'lodash';
import { v4 } from 'uuid';
import LuxonHelper from './luxonHelper';

export const parseToAlarmTrigger = (alarm: any): string => {
  return `${alarm.isBeforeEvent ? '-' : ''}PT${alarm.amount}${alarm.timeUnit
    .slice(0, 1)
    .toUpperCase()}`;
};

export const formatAppAlarm = (item: any) => {
  return {
    action: 'DISPLAY',
    trigger: parseToAlarmTrigger(item),
  };
};

export type CalendarMethod = 'REQUEST' | 'REPLY';
export const CALENDAR_REQUEST_METHOD: CalendarMethod = 'REQUEST';
export const CALENDAR_REPLY_METHOD: CalendarMethod = 'REPLY';

/**
 * Remove undefined props
 */
const getKnownProps = (item: any, type = 'VEVENT') => {
  const result: any = {};
  // Strip any methods
  const clone: any = JSON.parse(JSON.stringify(item));

  result['begin'] = type;

  let index = 0;
  let hasEnd = false;

  for (const [key, value] of Object.entries(clone)) {
    index += 1;
    if (index === 1) {
      if (key !== 'begin') {
        result['begin'] = type;
      }
    }
    if (value) {
      result[key] = value;
    }
    if (key === 'end') {
      hasEnd = true;
    }
  }

  if (!hasEnd) {
    result['end'] = type;
  }

  return result;
};

interface ICalHelperEvent {
  dtstart: any;
  dtend: any;
  dtstamp?: string;
  organizer?: any;
  uid?: string;
  attendee?: any;
  created?: string;
  description?: string;
  lastModified?: string;
  location?: string;
  sequence?: string;
  color?: string;
  status?: string;
  summary?: string;
  transp?: string;
  rrule?: string;
  props?: any;
  recurrenceID?: any;
  exdates?: any;
  [key: string]: any;
}

class ICalHelperV2 {
  events: ICalHelperEvent[] = [];

  constructor(data: CalDavEventObj[]) {
    forEach(data, (event) => {
      const {
        externalId,
        createdAt,
        updatedAt,
        startAt,
        endAt,
        summary,
        color,
        description,
        location,
        rRule,
        timezoneStartAt,
        organizer,
        attendees,
        props,
        allDay,
        alarms,
        exdates,
        recurrenceID,
        sequence,
        timezone,
        externalID,
      } = event;

      const result: any = {};

      result.dtstart = {
        value: allDay
          ? DateTime.fromISO(startAt).toFormat('yyyyMMdd')
          : formatIcalDate(startAt, timezoneStartAt),
        timezone: allDay ? undefined : timezoneStartAt || timezone,
      };
      result.dtend = {
        value: allDay
          ? DateTime.fromISO(endAt).plus({ day: 1 }).toFormat('yyyyMMdd')
          : formatIcalDate(endAt, timezoneStartAt),
        timezone: allDay ? undefined : timezoneStartAt || timezone,
      };
      result.uid = externalId ? externalId : externalID ? externalID : v4();
      if (attendees?.length) {
        result.attendee = attendees;
      }

      if (organizer) {
        result.organizer = organizer;
      }

      result.created = LuxonHelper.toUtcString(createdAt);
      result.dtstamp = DateTime.local().toUTC().toString();
      result.description = description;
      result.lastModified = LuxonHelper.toUtcString(updatedAt);
      result.rrule =
        rRule && rRule !== ''
          ? // eslint-disable-next-line @typescript-eslint/no-use-before-define
            rRule
          : undefined;
      result.summary = summary;
      result.location = location;
      // this.sequence = sequence;
      result.status = 'CONFIRMED';
      result.transp = 'OPAQUE';

      if (color) {
        result.color = color;
      }

      if (recurrenceID) {
        result.recurrenceId = {
          value:
            formatIcalDate(recurrenceID?.value, timezoneStartAt) ||
            recurrenceID,
          timezone: allDay ? undefined : timezoneStartAt || timezone,
        };
      }
      if (exdates?.length) {
        result.exdate = exdates;
      }

      if (attendees?.length) {
        result.attendee = attendees;
      }

      // include all other not supported properties
      if (props) {
        forEach(Object.entries(props), (propItem) => {
          if (propItem[0] === 'sequence') {
            if (sequence) {
              result.sequence = String(Number(propItem[1]));
            } else {
              result[propItem[0]] = String(Number(propItem[1]) + 1);
            }
          }
        });
      }

      // format alarms
      if (alarms?.length) {
        result.alarms = alarms;
      }

      if (!result.sequence) {
        result.sequence = '0';
      }

      this.events.push(result);
    });
  }

  private createCalendar = (method?: CalendarMethod) => {
    if (method) {
      return {
        begin: 'BEGIN:VCALENDAR',
        prodid: 'Bloben 1.0',
        method: method,
        calscale: 'GREGORIAN',
        version: '2.0',
        end: 'END:VCALENDAR',
      };
    } else {
      return {
        begin: 'BEGIN:VCALENDAR',
        prodid: 'Bloben 1.0',
        // method: 'REQUEST',
        calscale: 'GREGORIAN',
        version: '2.0',
        end: 'END:VCALENDAR',
      };
    }
  };

  public parseTo = (method?: CalendarMethod) => {
    const template = {
      calendar: this.createCalendar(method),
      events: map(this.events, (event) => getKnownProps(event)),
    };

    return ICalParser.toString(template);
  };
}

export default ICalHelperV2;
