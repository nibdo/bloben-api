import ICalParser from 'ical-js-parser';

import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { DateTime } from 'luxon';
import { DateTimeObject } from 'ical-js-parser';
import { forEach } from 'lodash';
import { formatIcalDate } from './davHelper';

export type CalendarMethod = 'REQUEST' | 'REPLY';
export const CALENDAR_REQUEST_METHOD: CalendarMethod = 'REQUEST';
export const CALENDAR_REPLY_METHOD: CalendarMethod = 'REPLY';

export enum CALENDAR_METHOD {
  REQUEST = 'REQUEST',
  REPLY = 'REPLY',
  CANCEL = 'CANCEL',
}

class ICalHelper {
  dtstart: DateTimeObject;
  dtend: DateTimeObject;
  dtstamp?: DateTimeObject;
  organizer?: any;
  uid?: string;
  attendee?: any;
  created?: DateTimeObject;
  description?: string;
  lastModified?: DateTimeObject;
  location?: string;
  sequence?: string;
  status?: string;
  summary?: string;
  transp?: string;
  rrule?: string;

  constructor(event: CalDavEventsRaw) {
    const {
      createdAt,
      startAt,
      endAt,
      summary,
      description,
      location,
      isRepeated,
      rRule,
      timezoneStartAt,
      props,
      externalID,
    } = event;

    this.dtstart = timezoneStartAt
      ? {
          value: formatIcalDate(startAt, timezoneStartAt),
          timezone: timezoneStartAt,
        }
      : {
          value: startAt,
        };
    this.dtend = timezoneStartAt
      ? {
          value: formatIcalDate(endAt, timezoneStartAt),
          timezone: timezoneStartAt,
        }
      : {
          value: endAt,
        };
    this.uid = externalID;
    this.organizer = props.organizer;
    // this.attendee = props.attendee;
    this.created = { value: createdAt };
    this.dtstamp = {
      value: DateTime.local().toUTC().toString(),
    };
    this.description = description;
    this.lastModified = {
      value: DateTime.local().toUTC().toString(),
    };
    this.rrule = isRepeated && rRule ? rRule : undefined;
    this.summary = summary;
    this.location = location;
    // this.sequence = props.sequence;
    // this.status = props.status;
    // this.transp = props.transp;

    if (props) {
      forEach(Object.entries(props), (propItem) => {
        if (propItem[0] === 'sequence') {
          this[propItem[0]] = String(Number(propItem[1]) + 1);
        } else {
          this[propItem[0]] = propItem[1];
        }
      });
    }
  }
  /**
   * Remove undefined props
   */
  private getKnownProps = () => {
    const result: any = {};
    // Strip any methods
    const clone: any = JSON.parse(JSON.stringify(this));

    result['begin'] = 'VEVENT';

    for (const [key, value] of Object.entries(clone)) {
      if (value) {
        result[key] = value;
      }
    }
    result['end'] = 'VEVENT';

    return result;
  };

  private createCalendar = (method: CALENDAR_METHOD) => ({
    begin: 'BEGIN:VCALENDAR',
    prodid: 'BLOBEN 1.0',
    method: method,
    calscale: 'GREGORIAN',
    version: '2.0',
    end: 'END:VCALENDAR',
  });

  public parseTo = (method: CALENDAR_METHOD = CALENDAR_METHOD.REQUEST) => {
    const template: any = {
      calendar: this.createCalendar(method),
      events: [this.getKnownProps()],
      todos: [],
      errors: [],
    };

    return ICalParser.toString(template);
  };
}

export default ICalHelper;
