import { ATTENDEE_PARTSTAT, SOURCE_TYPE } from '../data/types/enums';
import { Attendee, EventResult, EventStyle, Organizer } from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from './enums';
import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { DateTime } from 'luxon';
import { EVENT_TYPE, TASK_STATUS } from 'bloben-interface/enums';
import { find } from 'lodash';
import {
  getEventStyle,
  getTaskStyle,
} from '../api/app/event/helpers/getWebCalEvents';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';

const parseCalDavStyle = (
  event: CalDavEventsRaw,
  color: string,
  isDark: boolean
) => {
  let style: EventStyle = {};

  const isEmailInvite =
    event.props?.[BLOBEN_EVENT_KEY.INVITE_TO] &&
    event.props?.[BLOBEN_EVENT_KEY.INVITE_FROM];

  if (event.organizer?.mailto || isEmailInvite) {
    let userAttendee;

    // get user attendee
    if (isEmailInvite) {
      userAttendee = find(
        event.attendees,
        (item) => item.mailto === event.props?.[BLOBEN_EVENT_KEY.INVITE_TO]
      );
    } else if (event.organizer?.mailto) {
      userAttendee = find(
        event.attendees,
        (item) => item.mailto === event.organizer.mailto
      );
    }

    const partstat = userAttendee?.['PARTSTAT'];

    style = getEventStyle(partstat, userAttendee?.['ROLE'], color, isDark);
  }

  if (event.type === EVENT_TYPE.TASK) {
    const isChecked = event.status === TASK_STATUS.COMPLETED;

    style = getTaskStyle(isChecked);
  }

  return style;
};

export const getTaskCheckedStatus = (event: CalDavEventsRaw) => {
  if (event.type === EVENT_TYPE.TASK) {
    if (event.status === TASK_STATUS.COMPLETED) {
      return true;
    } else {
      return false;
    }
  }

  return false;
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
  startAt: event.startAt?.toISOString(),
  endAt: event.endAt?.toISOString(),
  timezoneStartAt: event.timezoneStartAt,
  timezoneEndAt: event.timezoneEndAt || event.timezoneStartAt,
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
  sourceType: SOURCE_TYPE.CALDAV,
  type: event.type,
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
    timezoneStartAt: event.timezoneStartAt,
    timezoneEndAt: event.timezoneEndAt || event.timezoneStartAt,
    etag: event.etag,
    url: event.href,
    isRepeated: event.isRepeated,
    rRule: event.rRule,
    sourceType: SOURCE_TYPE.CALDAV,
    type: event.type,
    // @ts-ignore
    status: event.status,
    valarms: event.valarms,
    attendees: event.attendees,
    exdates: event.exdates,
    organizer: event.organizer,
    recurrenceID: event.recurrenceID,
    props: event.props || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    style: parseCalDavStyle(event, eventColor, isDark),
    isTaskChecked: getTaskCheckedStatus(event),
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
