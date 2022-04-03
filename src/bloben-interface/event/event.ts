import { ALARM_TYPE, EVENT_TYPE } from '../enums';

export interface AlarmRequest {
  id: string;
  alarmType: ALARM_TYPE;
  amount: number;
  timeUnit: string;
  payload: string;
}
export interface Attendee {
  cn: string;
  role: string;
  rsvp: string;
  partstat: string;
  mailto: string;
}

export interface EmailInvite {
  eventDecrypted: EventDecrypted;
  attendees: Attendee[];
}

export interface EmailInviteData {
  subject: string;
  body: string;
  from: string;
  ical: string;
  method: string;
  recipients: string[];
}

export interface GetEventResponse {
  id: string;
  data: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string;
  color: string;
  alarms: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  internalID?: string;
  externalID: string;
}

export interface CreateCalDavEventRequest {
  externalID: string;
  calendarID: string;
  iCalString: string;
}

export interface UpdateCalDavEventRequest {
  id: string;
  calendarID: string;
  iCalString: string;
  externalID: string;
  etag: string;
  url: string;
  prevEvent: {
    id: string;
    externalID: string;
    url: string;
    etag: string;
  } | null;
}

export interface DeleteCalDavEventRequest {
  calendarID: string;
  id: string;
  etag: string;
  url: string;
}

export interface EventBody {
  id: string;
  data: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string | null;
  alarms: AlarmRequest[];
  eventInvite?: EmailInvite | null;
  createdAt: string;
  updatedAt: string;
  externalID?: string | null;
  deletedAt?: string | null;
}

export interface EventDecrypted {
  id: string;
  externalID: string | null;
  calendarID: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  allDay: boolean;
  color: string | null;
  description: string;
  location: string;
  attendees: any;
  organizer: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null | undefined;
  isRepeated: boolean;
  rRule: string | null;
  alarms: any;
  sequence: string;
}

export interface EventResult {
  id: string; // entity id
  externalID: string; // caldav, webcal id
  internalID?: string; // id to ref repeated events
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  timezoneEndAt: string | null;
  summary: string;
  description: string;
  location: string;
  allDay?: boolean;
  rRule: string | null;
  isRepeated: boolean;
  etag?: string;
  url?: string;
  type: EVENT_TYPE;
  color: string;
  calendarID: string;
  props: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
