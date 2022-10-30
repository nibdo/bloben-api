import { DateTime } from 'luxon';
import { DeleteRepeatedCalDavEventRequest } from 'bloben-interface';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import {
  createDeleteRepeatedEventBodyJSON,
  createRepeatedTestCalDavEvent,
  formatIcalStringDates,
} from '../calDavServerTestHelper';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { createTestCalendarCalendar } from '../../../testHelpers/calDavServerTestHelper';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/user-caldav-seed';
import { syncCalDavQueueJob } from '../../../../jobs/queueJobs/syncCalDavQueueJob';
import { v4 } from 'uuid';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/caldav-events/repeated';

const createBody = (body: DeleteRepeatedCalDavEventRequest) => body;

const getSyncedEvents = async (userID: string, remoteID: string) => {
  await syncCalDavQueueJob({ data: { userID } } as any);

  return CalDavEventRepository.getRepository().find({
    where: {
      externalID: remoteID,
    },
  });
};

describe(`[E2E] Delete calDav event repeated [DELETE] ${PATH}`, async function () {
  let eventData;
  let calendarID;
  let accountID;

  const baseDateTime = DateTime.now()
    .set({
      hour: 14,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toUTC();

  let userID;
  beforeEach(async () => {
    const { userData } = await seedUsersE2E();
    userID = userData.user.id;
    const calDavCalendar = await createTestCalendarCalendar(
      userData.user.id,
      userData.calDavAccount
    );
    eventData = await createRepeatedTestCalDavEvent(
      userData.user.id,
      userData.calDavAccount,
      calDavCalendar.id,
      baseDateTime
    );
    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const body = createBody(
      createDeleteRepeatedEventBodyJSON(
        invalidUUID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL
      )
    );
    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200 delete all', async function () {
    const body = createBody(
      createDeleteRepeatedEventBodyJSON(
        calendarID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    const events = await getSyncedEvents(userID, eventData.remoteID);

    assert.equal(events.length, 0);
  });

  it('Should get status 200 delete one occurrence with recurrenceID', async function () {
    const newDate = baseDateTime.plus({ day: 3 });
    const remoteID = v4();

    const recurrenceValue = formatIcalStringDates(newDate).startAt;
    const icalString = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${remoteID}
SUMMARY:origin
DTSTART;TZID=Europe/Berlin:${formatIcalStringDates(baseDateTime).startAt}
DTEND;TZID=Europe/Berlin:${formatIcalStringDates(baseDateTime).endAt}
EXDATE;TZID=Europe/Berlin:${
      formatIcalStringDates(baseDateTime.plus({ day: 5 })).startAt
    }
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
RRULE:FREQ=DAILY;INTERVAL=1
END:VEVENT
BEGIN:VEVENT
UID:${remoteID}
SUMMARY:refrecur
DTSTART;TZID=Europe/Berlin:${
      formatIcalStringDates(newDate.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(newDate.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${recurrenceValue}
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const eventDataCustom = await createRepeatedTestCalDavEvent(
      userID,
      accountID,
      calendarID,
      baseDateTime,
      remoteID,
      icalString
    );

    const body = createBody(
      createDeleteRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE_RECURRENCE_ID,
        {
          value: recurrenceValue,
          timezone: 'Europe/Berlin',
        }
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);

    const baseEvent = events[0];

    assert.equal(events.length, 1);
    assert.notEqual(baseEvent.rRule, null);
    assert.equal(baseEvent.exdates.length, 2);
  });

  it('Should get status 200 delete one occurrence', async function () {
    const remoteID = v4();

    const icalString = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${remoteID}
SUMMARY:origin
DTSTART;TZID=Europe/Berlin:${formatIcalStringDates(baseDateTime).startAt}
DTEND;TZID=Europe/Berlin:${formatIcalStringDates(baseDateTime).endAt}
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
RRULE:FREQ=DAILY;INTERVAL=1
END:VEVENT
END:VCALENDAR`;

    const eventDataCustom = await createRepeatedTestCalDavEvent(
      userID,
      accountID,
      calendarID,
      baseDateTime,
      remoteID,
      icalString
    );

    const body = createBody(
      createDeleteRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        undefined,
        [
          {
            value: formatIcalStringDates(baseDateTime.plus({ day: 5 })).startAt,
            timezone: 'Europe/Berlin',
          },
          {
            value: formatIcalStringDates(baseDateTime.plus({ day: 6 })).startAt,
            timezone: 'Europe/Berlin',
          },
        ]
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);

    const baseEvent = events[0];

    assert.equal(events.length, 1);
    assert.notEqual(baseEvent.rRule, null);
    assert.equal(baseEvent.exdates.length, 2);
    assert.equal(
      JSON.stringify(baseEvent.exdates[0]),
      JSON.stringify({
        value: formatIcalStringDates(baseDateTime.plus({ day: 5 })).startAt,
        timezone: 'Europe/Berlin',
      })
    );
    assert.equal(
      JSON.stringify(baseEvent.exdates[1]),
      JSON.stringify({
        value: formatIcalStringDates(baseDateTime.plus({ day: 6 })).startAt,
        timezone: 'Europe/Berlin',
      })
    );
  });
});
