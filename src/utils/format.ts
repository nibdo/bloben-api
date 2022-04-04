import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { DateTime } from 'luxon';
import { EVENT_TYPE } from '../bloben-interface/enums';
import { EventResult } from '../bloben-interface/event/event';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';

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
  etag: event.etag,
  url: event.href,
  props: event.props || null,
  type: EVENT_TYPE.CALDAV,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  deletedAt: event.deletedAt ? event.deletedAt.toISOString() : null,
});
export const formatEventRawToResult = (
  event: CalDavEventsRaw
): EventResult => ({
  id: event.id,
  externalID: event.externalID,
  internalID: event.internalID,
  summary: event.summary,
  location: event.location,
  description: event.description,
  // alarms: alarms[event.id] ? alarms[event.id] : [],
  allDay: event.allDay,
  calendarID: event.calendarID,
  color: event.eventColor || event.customColor || event.color,
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
  props: event.props || null,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
  deletedAt: event.deletedAt || null,
});

export const formatInviteStartDate = (startDate: string, timezone?: string) => {
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
  timezone?: string
) => {
  return `Invitation: ${summary} - ${formatInviteStartDate(
    startDate,
    timezone
  )}`;
};
