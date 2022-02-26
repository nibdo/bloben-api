import ICalParser from 'ical-js-parser-commonjs';

import { DateTime } from 'luxon';
import { DateTimeObject } from 'ical-js-parser-commonjs';
import { EventDecrypted } from '../bloben-interface/event/event';
import { env } from '../index';
import LuxonHelper from './luxonHelper';

export type CalendarMethod = 'REQUEST' | 'REPLY';
export const CALENDAR_REQUEST_METHOD: CalendarMethod = 'REQUEST';
export const CALENDAR_REPLY_METHOD: CalendarMethod = 'REPLY';

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

  constructor(event: EventDecrypted) {
    const {
      id,
      createdAt,
      updatedAt,
      startAt,
      endAt,
      summary,
      description,
      location,
      isRepeated,
      rRule,
      timezoneStart,
      attendees,
      externalID,
      sequence,
    } = event;

    this.dtstart = {
      value: LuxonHelper.toUtcString(startAt),
      timezone: timezoneStart,
    };
    this.dtend = {
      value: LuxonHelper.toUtcString(endAt),
      timezone: timezoneStart,
    };
    this.uid = externalID
      ? externalID
      : `${id}@${env.email.identity.slice(
          env.email.identity.indexOf('@' + 1)
        )}`;
    this.organizer = { cn: env.email.identity, mailto: env.email.identity };
    this.attendee = attendees;
    this.created = { value: LuxonHelper.toUtcString(createdAt) };
    this.dtstamp = {
      value: DateTime.local().toUTC().toString(),
    };
    this.description = description;
    this.lastModified = { value: LuxonHelper.toUtcString(updatedAt) };
    this.rrule = isRepeated && rRule ? rRule : undefined;
    this.summary = summary;
    this.location = location;
    this.sequence = sequence;
    this.status = 'CONFIRMED';
    this.transp = 'OPAQUE';
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

  private createCalendar = (method: CalendarMethod) => ({
    begin: 'BEGIN:VCALENDAR',
    prodid: 'BLOBEN 1.0',
    method: method,
    calscale: 'GREGORIAN',
    version: '2.0',
    end: 'END:VCALENDAR',
  });

  public parseTo = (method: CalendarMethod = CALENDAR_REQUEST_METHOD) => {
    const template: any = {
      calendar: this.createCalendar(method),
      events: [this.getKnownProps()],
    };

    return ICalParser.toString(template);
  };
}

export default ICalHelper;
