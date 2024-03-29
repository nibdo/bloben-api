import { ATTENDEE_PARTSTAT } from '../data/types/enums';
import {
  Attendee,
  EVENT_TYPE,
  EventResult,
  EventStyle,
  Organizer,
  SOURCE_TYPE,
  TASK_STATUS,
} from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from './enums';
import { CalDavEventObj } from './davHelper';
import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { find } from 'lodash';
import { getDateTime } from './common';
import {
  getEventStyle,
  getTaskStyle,
} from '../api/app/event/helpers/getWebCalEvents';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';
import Datez from 'datez';

export const ICAL_FORMAT = `yyyyMMdd'T'HHmmss`;

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
  sourceType: event.props?.[BLOBEN_EVENT_KEY.INVITE_FROM]
    ? SOURCE_TYPE.EMAIL_INVITE
    : SOURCE_TYPE.CALDAV,
  updateDisabled: !!event.props?.[BLOBEN_EVENT_KEY.INVITE_FROM],
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
    sourceType: event.props?.[BLOBEN_EVENT_KEY.INVITE_FROM]
      ? SOURCE_TYPE.EMAIL_INVITE
      : SOURCE_TYPE.CALDAV,
    updateDisabled: !!event.props?.[BLOBEN_EVENT_KEY.INVITE_FROM],
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

export const formatInviteStartDate = (
  startDate: string | Date,
  timezone?: string
) => {
  if (timezone) {
    return Datez.setZone(getDateTime(startDate), timezone).toFormat(
      'ccc d LLL yyyy hh:mm'
    );
  } else {
    return getDateTime(startDate).toFormat('ccc d LLL yyyy hh:mm');
  }
};

export const formatCancelStartDate = (
  startDate: string | Date,
  timezone?: string
) => {
  if (timezone) {
    return Datez.setZone(getDateTime(startDate), timezone).toFormat(
      'ccc d LLL yyyy hh:mm'
    );
  } else {
    return getDateTime(startDate).toFormat('ccc d LLL yyyy hh:mm');
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

export const formatEventRawToCalDavObj = (
  event: CalDavEventsRaw
): CalDavEventObj => {
  return {
    color: event.color,
    href: event.href,
    timezone: event.timezoneStartAt,
    timezoneEnd: event.timezoneEndAt || event.timezoneStartAt,
    id: event.id,
    externalID: event.externalID,
    internalID: event.internalID,
    summary: event.summary,
    location: event.location,
    description: event.description,
    allDay: event.allDay,
    calendarID: event.calendarID,
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
  };
};
