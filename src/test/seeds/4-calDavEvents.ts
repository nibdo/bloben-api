import { Connection, MigrationInterface, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { testUserData } from './1-user-seed';
import UserEntity from '../../data/entity/UserEntity';
import { CreateCalDavEventRequest } from '../../bloben-interface/event/event';
import CalDavCalendarEntity from '../../data/entity/CalDavCalendar';
import CalDavEventEntity from '../../data/entity/CalDavEventEntity';
import ICalParser, { EventJSON } from 'ical-js-parser-commonjs';
import { formatEventJsonToCalDavEvent } from '../../utils/davHelper';
import { DAVCalendarObject } from 'tsdav';
import { v4 } from 'uuid';

export const createDummyCalDavEvent = (
  calendarID: string
): CreateCalDavEventRequest => {
  const externalID = v4();
  return {
    externalID,
    calendarID,
    iCalString: `BEGIN:VCALENDAR
METHOD:REQUEST
PRODID:Test
VERSION:2.0
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
  calendarID: string
): CreateCalDavEventRequest => {
  const externalID = v4();
  return {
    externalID,
    calendarID,
    iCalString: `BEGIN:VCALENDAR
METHOD:REQUEST
PRODID:Test
VERSION:2.0
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
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

export const testIcalString = `BEGIN:VCALENDAR
METHOD:REQUEST
PRODID:Test
VERSION:2.0
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
];

export class calDavEvents implements MigrationInterface {
  public async up(): Promise<{ event: CalDavEventEntity }> {
    // @ts-ignore
    const connection: Connection = await getConnection();

    const [user, calendar] = await Promise.all([
      connection.manager.findOne(UserEntity, {
        where: {
          username: testUserData.username,
        },
      }),
      connection.manager.findOne(CalDavCalendarEntity, {
        where: {
          url: `http://${testUserData.username}`,
        },
      }),
    ]);

    const events: CalDavEventEntity[] = [];

    forEach(testEventsData, (event) => {
      const icalJS = ICalParser.toJSON(event.iCalString);
      const eventJSON: EventJSON = icalJS.events[0];
      const eventObj = formatEventJsonToCalDavEvent(
        eventJSON,
        {
          data: '',
          etag: '123',
          url: `http://${testUserData.username}`,
        } as DAVCalendarObject,
        calendar
      );

      events.push(new CalDavEventEntity(eventObj));
    });

    await connection.manager.save(events);

    return { event: events[0] };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
