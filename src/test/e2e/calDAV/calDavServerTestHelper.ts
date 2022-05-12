import { createCalDavCalendar } from '../../../api/calDavCalendar/handlers/createCalDavCalendar';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';
import {
  CALDAV_COMPONENTS,
  EVENT_TYPE,
  REPEATED_EVENT_CHANGE_TYPE,
} from '../../../bloben-interface/enums';
import { CALDAV_TEST_ACCOUNT } from '../seeds/1-user-caldav-seed';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';
import { createCalDavEvent } from '../../../api/calDavEvent/handlers/createCalDavEvent';
import { v4 } from 'uuid';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import {
  CreateCalDavEventRequest, DeleteRepeatedCalDavEventRequest,
  UpdateRepeatedCalDavEventRequest,
} from '../../../bloben-interface/event/event';
import { DateTime } from 'luxon';
import {DateTimeObject} from "ical-js-parser";
import {formatIcalDate} from "../../../utils/davHelper";

export const createDummyCalDavEvent = (
  calendarID: string,
  remoteID?: string
): CreateCalDavEventRequest => {
  const externalID = remoteID || v4();
  return {
    externalID,
    calendarID,
    iCalString: `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:${externalID}
SUMMARY:teaaaaa
DTSTART:20210401T110000Z
DTEND:20210401T113000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`,
  };
};

export const formatIcalStringDatesUtc = (date: DateTime) => {
  return {
    startAt: `${date.toFormat('yyyyMMdd')}T${date.toFormat('HHmm')}00Z`,
    endAt: `${date.plus({ hour: 1 }).toFormat('yyyyMMdd')}T${date
      .plus({ hour: 1 })
      .toFormat('HHmm')}00Z`,
  };
};
export const formatIcalStringDates = (date: DateTime) => {
  const dateEnd = date.plus({hour: 1}).setZone('Europe/Berlin')

  return {
    startAt: formatIcalDate(date.toString(), 'Europe/Berlin'),
    endAt: formatIcalDate(dateEnd.toString(), 'Europe/Berlin'),
  };
};

export const createDummyCalDavEventWithRepeatedAlarm = (
  calendarID: string,
  date: DateTime,
  remoteID?: string
): CreateCalDavEventRequest => {
  const externalID = remoteID || v4();
  return {
    externalID,
    calendarID,
    iCalString: `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B730
UID:${externalID}
SUMMARY:teaaaaaRep
DTSTART:${formatIcalStringDates(date).startAt}
DTEND:${formatIcalStringDates(date).endAt}
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT10M
END:VALARM
RRULE:FREQ=DAILY;INTERVAL=1
END:VEVENT
END:VCALENDAR`,
  };
};

export const createTestCalendarCalendar = async (
  userID: string,
  account: CalDavAccountEntity
) => {
  const { data } = await createCalDavCalendar(
    {
      body: {
        accountID: account.id,
        name: 'test',
        color: 'blue',
        components: ['VEVENT'],
      },
    } as any,
    { locals: { userID } } as any
  );

  const calendarUrl = `${CALDAV_TEST_ACCOUNT.url}/calendars/${CALDAV_TEST_ACCOUNT.username}/${data.remoteID}/`;
  const newCalendar = new CalDavCalendarEntity();
  newCalendar.url = calendarUrl;
  newCalendar.calDavAccount = account;
  newCalendar.displayName = 'test_new';
  newCalendar.data = JSON.stringify({
    description: '',
    timezone: 'UTC',
    url: calendarUrl,
    ctag: 'http://sabre.io/ns/sync/2021',
    calendarColor: '#330099',
    displayName: 'test_new',
    components: ['VEVENT', 'VTODO'],
    resourcetype: ['collection', 'calendar'],
    syncToken: 'http://sabre.io/ns/sync/2021',
    reports: [
      'expandProperty',
      'principalMatch',
      'principalPropertySearch',
      'principalSearchPropertySet',
      'syncCollection',
      'calendarMultiget',
      'calendarQuery',
      'freeBusyQuery',
    ],
  });
  newCalendar.components = [CALDAV_COMPONENTS.VEVENT, CALDAV_COMPONENTS.VTODO];

  await CalDavCalendarRepository.create(newCalendar);

  return newCalendar;
};

export const createTestCalDavEvent = async (
  userID: string,
  account: CalDavAccountEntity,
  calendarID
): Promise<{ id: string; etag: string; url: string; remoteID: string }> => {
  const remoteID = v4();
  const response = await createCalDavEvent(
    {
      body: {
        externalID: remoteID,
        calendarID: calendarID,
        iCalString: createDummyCalDavEvent(calendarID, remoteID).iCalString,
      },
    } as any,
    {
      locals: { userID },
    } as any
  );

  const eventEntity = await CalDavEventRepository.getRepository().findOne({
    where: {
      externalID: remoteID,
    },
  });

  return {
    ...response.data,
    id: eventEntity.id,
    etag: eventEntity.etag,
    url: eventEntity.href,
    remoteID,
  };
};

export const createRepeatedTestCalDavEvent = async (
  userID: string,
  account: CalDavAccountEntity,
  calendarID,
  date: DateTime,
  externalID?: string,
  iCalString?: string
): Promise<{ id: string; etag: string; url: string; remoteID: string }> => {
  const remoteID = externalID || v4();
  const response = await createCalDavEvent(
    {
      body: {
        externalID: remoteID,
        calendarID: calendarID,
        iCalString: iCalString
          ? iCalString
          : createDummyCalDavEventWithRepeatedAlarm(calendarID, date, remoteID)
              .iCalString,
      },
    } as any,
    {
      locals: { userID },
    } as any
  );

  const eventEntity = await CalDavEventRepository.getRepository().findOne({
    where: {
      externalID: remoteID,
    },
  });

  return {
    ...response.data,
    id: eventEntity.id,
    etag: eventEntity.etag,
    url: eventEntity.href,
    remoteID,
  };
};

export const createDeleteRepeatedEventBodyJSON = (
    calendarID: string,
    id: string,
    externalID: string,
    url: string,
    etag: string,
    type: REPEATED_EVENT_CHANGE_TYPE,
    recurrenceID?: DateTimeObject,
    exDates?: any,
    iCalString?: string
): DeleteRepeatedCalDavEventRequest => {
  return {
    calendarID,
    etag,
    exDates: exDates || [],
    iCalString,
    id,
    recurrenceID,
    type,
    url
  }
}

export const createRepeatedEventBodyJSON = (
  calendarID: string,
  id: string,
  externalID: string,
  url: string,
  etag: string,
  type: REPEATED_EVENT_CHANGE_TYPE,
  startAt?: string,
  endAt?: string,
  recurrenceID?: string,
  summary?: string,
  rRule?: string,
  prevEvent?: any,
  attendees?: any
): UpdateRepeatedCalDavEventRequest => {
  return {
    calendarID,
    event: {
      id: id,
      externalID,
      summary: summary || 'dsvdsv',
      location: null,
      description: null,
      allDay: false,
      calendarID,
      color: 'indigo',
      startAt: startAt || '2022-05-07T13:45:30.000Z',
      endAt: endAt || '2022-05-07T14:45:30.000Z',
      timezoneEndAt: 'Europe/Berlin',
      timezoneStartAt: 'Europe/Berlin',
      etag,
      url,
      isRepeated: true,
      rRule: rRule || null,
      type: EVENT_TYPE.CALDAV,
      valarms: [],
      attendees: attendees || [],
      exdates: [],
      recurrenceID: recurrenceID
        ? {
            value: formatIcalDate(recurrenceID, 'Europe/Berlin'),
            timezone: 'Europe/Berlin',
          }
        : undefined,
      props: { status: 'CONFIRMED', transp: 'OPAQUE', sequence: '1' },
      createdAt: '2022-05-08T14:11:40.910Z',
      updatedAt: '2022-05-08T14:11:40.910Z',
    },
    id,
    externalID,
    url,
    etag,
    type,
    prevEvent: prevEvent || null,
  };
};
