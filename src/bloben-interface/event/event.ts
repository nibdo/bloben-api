import { ALARM_TYPE } from '../enums';

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
  timezoneStart: string;
  timezoneEnd: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string;
  color: string;
  alarms: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  externalID: string;
}

export interface CreateCalDavEventRequest {
  id: string;
  calendarID: string;
  iCalString: string;
}

export interface UpdateCalDavEventRequest {
  id: string;
  calendarID: string;
  iCalString: string;
  internalID: string;
  etag: string;
  url: string;
  prevEvent: {
    id: string;
    internalID: string;
    url: string;
    etag: string;
  } | null;
}

export interface DeleteCalDavEventRequest {
  calendarID: string;
  internalID: string;
  etag: string;
  url: string;
}

export interface EventBody {
  id: string;
  data: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezoneStart: string;
  timezoneEnd: string;
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
  calendarID: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStart: string;
  timezoneEnd: string;
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
  externalID: string | null;
}

export interface EventResult {
  id: string;
  internalID: string;
  startAt: string;
  endAt: string;
  timezoneStart: string | null;
  timezoneEnd: string | null;
  summary: string;
  description: string;
  location: string;
  allDay?: boolean;
  rRule: string | null;
  isRepeated: boolean;
  etag: string;
  url: string;
  color: string;
  calendarID: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
