import { ATTENDEE_PARTSTAT, EVENT_TYPE } from '../bloben-interface/enums';
import {
  Attendee,
  EventResult,
  Organizer,
} from '../bloben-interface/event/event';
import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { DateTime } from 'luxon';
import { EventStyle } from '../bloben-interface/interface';
import { find } from 'lodash';
import { getEventStyle } from '../api/event/helpers/getWebCalEvents';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';

const parseCalDavStyle = (
  event: CalDavEventsRaw,
  color: string,
  isDark: boolean
) => {
  let style: EventStyle = {};

  if (event.organizer?.mailto) {
    // get user attendee
    const userAttendee = find(
      event.attendees,
      (item) => item.mailto === event.organizer.mailto
    );

    const partstat = userAttendee?.['PARTSTAT'];

    style = getEventStyle(partstat, userAttendee?.['ROLE'], color, isDark);
  }

  return style;
};

export const formatEventEntityToResult = (
  event: CalDavEventEntity
): EventResult => ({
  id: event.id,
  externalID: event.externalID,
  summary: event.summary,
  location: event.location,
  description: event.description,
  // alarms: alarms[event.id] ? alarms[event.id] : [],
  allDay: event.allDay,
  calendarID: event.calendar.id,
  color: event.calendar.color,
  // data: event.data,
  startAt: event.startAt.toISOString(),
  endAt: event.endAt.toISOString(),
  timezoneEndAt: event.timezoneStartAt,
  timezoneStartAt: event.timezoneStartAt,
  // externalID: event.externalID,
  isRepeated: event.isRepeated,
  rRule: event.rRule,
  attendees: event.attendees.length ? (event.attendees as Attendee[]) : null,
  exdates: event.exdates,
  valarms: event.valarms,
  organizer: event.organizer ? (event.organizer as Organizer) : null,
  recurrenceID: event.recurrenceID,
  etag: event.etag,
  url: event.href,
  props: event.props || null,
  type: EVENT_TYPE.CALDAV,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});
export const formatEventRawToResult = (
  event: CalDavEventsRaw,
  isDark: boolean
): EventResult => {
  const eventColor =
    event.eventCustomColor || event.customCalendarColor || event.color;
  return {
    id: event.id,
    externalID: event.externalID,
    internalID: event.internalID,
    summary: event.summary,
    location: event.location,
    description: event.description,
    // alarms: alarms[event.id] ? alarms[event.id] : [],
    allDay: event.allDay,
    calendarID: event.calendarID,
    color: eventColor,
    // data: event.data,
    startAt: event.startAt,
    endAt: event.endAt,
    timezoneEndAt: event.timezoneStartAt,
    timezoneStartAt: event.timezoneStartAt,
    etag: event.etag,
    url: event.href,
    isRepeated: event.isRepeated,
    rRule: event.rRule,
    type: EVENT_TYPE.CALDAV,
    valarms: event.valarms,
    attendees: event.attendees,
    exdates: event.exdates,
    organizer: event.organizer,
    recurrenceID: event.recurrenceID,
    props: event.props || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    style: parseCalDavStyle(event, eventColor, isDark),
  };
};

export const formatInviteStartDate = (startDate: string, timezone?: string) => {
  if (timezone) {
    return DateTime.fromISO(startDate)
      .setZone(timezone)
      .toFormat('ccc d LLL yyyy hh:mm');
  } else {
    return DateTime.fromISO(startDate).toFormat('ccc d LLL yyyy hh:mm');
  }
};

export const formatCancelStartDate = (startDate: string, timezone?: string) => {
  if (timezone) {
    return DateTime.fromISO(startDate)
      .setZone(timezone)
      .toFormat('ccc d LLL yyyy hh:mm');
  } else {
    return DateTime.fromISO(startDate).toFormat('ccc d LLL yyyy hh:mm');
  }
};

export const formatEventInviteSubject = (
  summary: string,
  startDate: string,
  timezone?: string,
  inviteMessage?: string
) => {
  return `Invitation: ${summary} - ${formatInviteStartDate(
    startDate,
    timezone
  )}${inviteMessage ? `\n\n\nNote: ${inviteMessage}` : ''}`;
};

const parsePartstat = (partStat: ATTENDEE_PARTSTAT) => {
  if (partStat === ATTENDEE_PARTSTAT.TENTATIVE) {
    return `Tentative: `;
  } else if (partStat === ATTENDEE_PARTSTAT.DECLINED) {
    return 'Rejected: ';
  } else if (partStat === ATTENDEE_PARTSTAT.ACCEPTED) {
    return 'Accepted';
  }

  return '';
};

export const formatPartstatResponseSubject = (
  summary: string,
  partStat: ATTENDEE_PARTSTAT,
  startDate: string,
  timezone?: string
) => {
  return `${parsePartstat(partStat)}: ${summary} - ${formatInviteStartDate(
    startDate,
    timezone
  )}`;
};

export const formatEventCancelSubject = (
  summary: string,
  startDate: string,
  timezone?: string,
  inviteMessage?: string
) => {
  return `Canceled: ${summary} - ${formatCancelStartDate(startDate, timezone)}${
    inviteMessage ? `\n\n\nNote: ${inviteMessage}` : ''
  }`;
};
