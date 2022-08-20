import { Connection, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { CreateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { DAVCalendarObject } from 'tsdav';
import { DateTime } from 'luxon';
import { formatEventJsonToCalDavEvent } from '../../../utils/davHelper';
import { seedCalDavCalendars } from './3-calDavCalendars';
import { v4 } from 'uuid';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import ICalParser, { EventJSON } from 'ical-js-parser';
import UserEntity from '../../../data/entity/UserEntity';

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

export const createDummyCalDavEventWithAttendees = (
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
DESCRIPTION:adadasds
UID:${externalID}
ORGANIZER;CN=test:mailto:test@bloben.com
ATTENDEE;CN=tester@bloben.com;ROLE=REQ-PARTICIPANT;RSVP=TRUE;PARTSTAT=NEEDS-A
 CTION:mailto:tester@bloben.com
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

export const createDummyCalDavEventWithAlarm = (
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
DESCRIPTION:adadasd174C5B7
UID:${externalID}
SUMMARY:event and alarm
DTSTART:20210401T110000Z
DTEND:20210401T113000Z
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
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
END:VALARM
END:VEVENT
END:VCALENDAR`,
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
DTSTART:${date.toFormat('yyyyMMdd')}T${date.toFormat('HHmm')}00Z
DTEND:${date.plus({ hour: 1 }).toFormat('yyyyMMdd')}T${date
      .plus({ hour: 1 })
      .toFormat('HHmm')}00Z
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

export const testIcalString = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd17
UID:040000008200E001
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
END:VCALENDAR`;

export const testIcalStringWrongDate = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:040000008200E00174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 0100000000843E9436BC801248C955E340249C503
SUMMARY:teaaaaa41515311111
DTSTART:XXXXXXXXXXXXXXXXXXX
DTEND:20210401T113000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`;

export const testIcalStringUnsupportedZone = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:0400000082003E00174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 0100000000843E9436BC801248C955234E340249C503
SUMMARY:ABCDE9812345
DTSTART;TZID=US-Eastern:20210201T080000Z
DTEND;TZID=US-Eastern:20210201T10000000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`;

export const testIcalStringTimeFormat = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:0400asf14151515
SUMMARY:ABCDE987456
DTSTART:20210201T080000Z
DTEND:20210201T10000000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`;

export const testIcalStringRepeated = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:040000008200E00174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 0100000000843E9436BC801248C955E340249C503
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
RRULE:FREQ=DAILY;INTERVAL=1
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT10M
END:VALARM
END:VEVENT
END:VCALENDAR`;

export const testEventsData: CreateCalDavEventRequest[] = [
  {
    externalID: '7becdebb-81d1-45b6-b8db-4a50f06b2a2c',
    calendarID: '',
    iCalString: testIcalString,
  },
  {
    externalID: 'ca5be5b5-c73f-4040-b909-e4a73a716671',
    calendarID: '',
    iCalString: testIcalString,
  },
  {
    externalID: 'ca5be5b5-c73f-2020-b909-e4a73a716671',
    calendarID: '',
    iCalString: testIcalStringRepeated,
  },
];

export const seedCalDavEvents = async (
  userID: string
): Promise<{
  event: CalDavEventEntity;
  repeatedEvent: CalDavEventEntity;
}> => {
  // @ts-ignore
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const { calDavCalendar } = await seedCalDavCalendars(userID);

  const events: CalDavEventEntity[] = [];

  forEach(testEventsData, (event) => {
    const icalJS = ICalParser.toJSON(event.iCalString);
    const eventJSON: EventJSON = icalJS.events[0];
    const eventObj = formatEventJsonToCalDavEvent(
      eventJSON,
      {
        data: '',
        etag: '123',
        url: `http://${user.username}`,
      } as DAVCalendarObject,
      calDavCalendar
    );

    events.push(new CalDavEventEntity(eventObj));
  });

  await connection.manager.save(events);

  return { event: events[0], repeatedEvent: events[2] };
};
