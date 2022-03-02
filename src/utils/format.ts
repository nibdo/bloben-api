import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { EVENT_TYPE } from '../bloben-interface/enums';
import { EventResult } from '../bloben-interface/event/event';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';

export const formatEventEntityToResult = (
  event: CalDavEventEntity
): EventResult => ({
  id: event.externalID,
  internalID: event.id,
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
  timezoneEnd: event.timezoneStart,
  timezoneStart: event.timezoneStart,
  // externalID: event.externalID,
  isRepeated: event.isRepeated,
  rRule: event.rRule,
  etag: event.etag,
  url: event.href,
  type: EVENT_TYPE.CALDAV,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  deletedAt: event.deletedAt ? event.deletedAt.toISOString() : null,
});
export const formatEventRawToResult = (
  event: CalDavEventsRaw
): EventResult => ({
  id: event.id,
  internalID: event.internalID,
  summary: event.summary,
  location: event.location,
  description: event.description,
  // alarms: alarms[event.id] ? alarms[event.id] : [],
  allDay: event.allDay,
  calendarID: event.calendarID,
  color: event.color,
  // data: event.data,
  startAt: event.startAt,
  endAt: event.endAt,
  timezoneEnd: event.timezoneStart,
  timezoneStart: event.timezoneStart,
  etag: event.etag,
  url: event.href,
  // externalID: event.externalID,
  isRepeated: event.isRepeated,
  rRule: event.rRule,
  type: EVENT_TYPE.CALDAV,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
  deletedAt: event.deletedAt || null,
});
