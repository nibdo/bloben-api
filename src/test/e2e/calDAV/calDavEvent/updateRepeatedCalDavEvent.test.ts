import { DateTime } from 'luxon';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import { UpdateRepeatedCalDavEventRequest } from 'bloben-interface';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {
  createRepeatedEventBodyJSON,
  createRepeatedTestCalDavEvent,
  formatIcalStringDates,
} from '../calDavServerTestHelper';
import { createTestCalendarCalendar } from '../../../testHelpers/calDavServerTestHelper';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/user-caldav-seed';
import { syncCalDavQueueJob } from '../../../../jobs/queueJobs/syncCalDavQueueJob';
import { v4 } from 'uuid';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/caldav-events/repeated';

const createBody = (body: UpdateRepeatedCalDavEventRequest) => body;

const getSyncedEvents = async (userID: string, remoteID: string) => {
  await syncCalDavQueueJob({ data: { userID } } as any);

  return CalDavEventRepository.getRepository().find({
    where: {
      externalID: remoteID,
    },
  });
};

const getSyncedEventsAndRecurrences = async (
  userID: string,
  remoteID: string,
  calendarID: string
) => {
  await syncCalDavQueueJob({ data: { userID } } as any);

  const events = await CalDavEventRepository.getRepository().find({
    where: {
      externalID: remoteID,
      calendarID,
    },
  });

  const exceptions = await CalDavEventExceptionRepository.getRepository().find({
    where: {
      externalID: remoteID,
      calDavCalendarID: calendarID,
    },
  });

  return {
    exceptions,
    events,
  };
};

describe(`[E2E] Update calDav event repeated [PUT] ${PATH}`, async function () {
  let eventData;
  let calendarID;
  let calendarID2;
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
    const calDavCalendar2 = await createTestCalendarCalendar(
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
    calendarID2 = calDavCalendar2.id;
  });

  it('Should get status 404', async function () {
    const body = createBody(
      createRepeatedEventBodyJSON(
        invalidUUID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL
      )
    );
    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    const events = await getSyncedEvents(userID, eventData.remoteID);

    assert.equal(events.length, 1);
  });

  it('Should get status 200 update all with new rRule', async function () {
    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        undefined,
        undefined,
        undefined,
        'test',
        'FREQ=WEEKLY;INTERVAL=1'
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    const events = await getSyncedEvents(userID, eventData.remoteID);

    assert.equal(events.length, 1);
    assert.equal(events[0].rRule, 'FREQ=WEEKLY;INTERVAL=1');
  });

  it('Should get status 409 cannot change calendar for single recurrence', async function () {
    const newDate = baseDateTime.plus({ day: 2 });

    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID2,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        newDate.toString(),
        'summary',
        undefined,
        {
          externalID: eventData.remoteID,
          id: eventData.id,
          etag: eventData.etag,
          url: eventData.url,
        }
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 cannot change attendees', async function () {
    const newDate = baseDateTime.plus({ day: 2 });

    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        newDate.toString(),
        'summary',
        undefined,
        undefined,
        [{ mailto: 'test@bloben.com' }]
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 409);
    assert.equal(
      response.body.message,
      'Attendees can be changed only for' + ' all instances'
    );
  });

  it('Should get status 200 single with one recurrence', async function () {
    const newDate = baseDateTime.plus({ day: 1 });

    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID,
        eventData.id,
        eventData.remoteID,
        eventData.url,
        eventData.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        newDate.set({ hour: 18 }).toString(),
        newDate.set({ hour: 19 }).toString(),
        newDate.toString(),
        undefined,
        'FREQ=YEARLY'
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const { events, exceptions } = await getSyncedEventsAndRecurrences(
      userID,
      eventData.remoteID,
      eventData.calendarID
    );

    const exception = exceptions[0];

    assert.equal(events.length, 2);
    assert.equal(
      DateTime.fromJSDate(exception.exceptionDate).toUTC().toString(),
      newDate.set({ hour: 14 }).toUTC().toString(),
      'baseEvent startAt'
    );
  });

  it('Should get status 200 single with two recurrences', async function () {
    const dateRef = baseDateTime.plus({ day: 1 });
    const newDate = baseDateTime.plus({ day: 2 });
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
BEGIN:VEVENT
UID:${remoteID}
SUMMARY:refrecur
DTSTART;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${formatIcalStringDates(dateRef).startAt}
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
      createRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        newDate.set({ hour: 21 }).toUTC().toString(),
        newDate.set({ hour: 22 }).toUTC().toString(),
        newDate.toUTC().toString()
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);

    const baseEvent = events[0];
    const recurrenceEvent = events[1];
    const recurrenceEvent2 = events[2];

    assert.equal(events.length, 3);
    assert.notEqual(baseEvent.rRule, null);
    assert.equal(recurrenceEvent.rRule, null);
    assert.equal(recurrenceEvent2.rRule, null);
    assert.equal(
      baseEvent.startAt.valueOf(),
      baseDateTime.toUTC().valueOf(),
      'baseEvent startAt'
    );
    assert.equal(
      recurrenceEvent.startAt.valueOf(),
      dateRef.set({ hour: 3 }).valueOf(),
      'recurrenceEvent startAt'
    );
    assert.equal(
      recurrenceEvent2.startAt.valueOf(),
      newDate.set({ hour: 21 }).valueOf(),
      'recurrenceEvent2 startAt'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(recurrenceEvent.recurrenceID?.value, {
        // @ts-ignore
        zone: recurrenceEvent.recurrenceID?.timezone,
      })
        .toUTC()
        .toString(),
      dateRef.toString(),
      'recurrenceEvent recurrenceID'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(recurrenceEvent2.recurrenceID?.value, {
        // @ts-ignore
        zone: recurrenceEvent2.recurrenceID?.timezone,
      })
        .toUTC()
        .toString(),
      newDate.toString(),
      'recurrenceEvent2 recurrenceID'
    );
  });

  it('Should get status 200 single with two recurrences and exdate', async function () {
    const dateRef = baseDateTime.plus({ day: 1 });
    const newDate = baseDateTime.plus({ day: 2 });
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
      formatIcalStringDates(dateRef.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${formatIcalStringDates(dateRef).startAt}
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
      createRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        newDate.toString()
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);
    const baseEvent = events[0];
    const recurrenceEvent = events[1];
    const recurrenceEvent2 = events[2];

    assert.equal(events.length, 3);
    assert.notEqual(baseEvent.rRule, null);
    assert.equal(recurrenceEvent.rRule, null);
    assert.equal(recurrenceEvent2.rRule, null);
    assert.equal(
      DateTime.fromJSDate(baseEvent.startAt, {
        zone: baseEvent?.timezoneStartAt,
      })
        .toUTC()
        .toString(),
      baseDateTime.toUTC().toString(),
      'baseEvent startAt'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(baseEvent.exdates[0].value, {
        // @ts-ignore
        zone: baseEvent.exdates[0]?.timezone,
      })
        .toUTC()
        .toString(),
      baseDateTime.plus({ day: 5 }).toUTC().toString(),
      'baseEvent exdate'
    );
    assert.equal(
      recurrenceEvent.startAt.valueOf(),
      dateRef.set({ hour: 3 }).valueOf(),
      'recurrenceEvent startAt'
    );
    assert.equal(
      recurrenceEvent2.startAt.valueOf(),
      newDate.set({ hour: 21 }).valueOf(),
      'recurrenceEvent2 startAt'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(recurrenceEvent.recurrenceID?.value, {
        // @ts-ignore
        zone: recurrenceEvent.recurrenceID?.timezone,
      })
        .toUTC()
        .toString(),
      dateRef.toUTC().toString(),
      'recurrenceEvent recurrenceID'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(recurrenceEvent2.recurrenceID?.value, {
        // @ts-ignore
        zone: recurrenceEvent2.recurrenceID?.timezone,
      })
        .toUTC()
        .toString(),
      newDate.toUTC().toString(),
      'recurrenceEvent2 recurrenceID'
    );
  });

  it('Should get status 200 this and future with one recurrence before', async function () {
    const dateRef = baseDateTime.plus({ day: 1 });
    const newDate = baseDateTime.plus({ day: 10 });
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
EXDATE;TZID=Europe/Berlin:${
      formatIcalStringDates(baseDateTime.plus({ day: 4 })).startAt
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
      formatIcalStringDates(dateRef.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${formatIcalStringDates(dateRef).startAt}
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

    const summary = `THIS_AND_FUTURE${v4()}`;
    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        newDate.toString(),
        summary
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);
    const baseEvent = events[0];
    const recurrenceEvent = events[1];

    const futureEvents = await CalDavEventRepository.getRepository().find({
      where: {
        summary,
      },
    });

    assert.equal(events.length, 2);
    assert.notEqual(baseEvent.rRule, null);
    assert.notEqual(baseEvent.rRule.indexOf('UNTIL'), -1);
    assert.equal(recurrenceEvent.rRule, null);
    assert.equal(
      DateTime.fromJSDate(baseEvent.startAt).toUTC().toString(),
      baseDateTime.toUTC().toString(),
      'baseEvent startAt'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(baseEvent.exdates[0].value, {
        // @ts-ignore
        zone: baseEvent.exdates[0]?.timezone || undefined,
      })
        .toUTC()
        .toString(),
      baseDateTime.plus({ day: 4 }).toUTC().toString(),
      'baseEvent exdate'
    );
    assert.equal(
      recurrenceEvent.startAt.valueOf(),
      dateRef.set({ hour: 3 }).valueOf(),
      'recurrenceEvent startAt'
    );
    assert.equal(
      // @ts-ignore
      DateTime.fromISO(recurrenceEvent.recurrenceID?.value, {
        // @ts-ignore
        zone: recurrenceEvent.recurrenceID?.timezone,
      })
        .toUTC()
        .toString(),
      dateRef.toUTC().toString(),
      'recurrenceEvent recurrenceID'
    );
    assert.equal(futureEvents.length, 1);
    assert.equal(futureEvents[0].rRule, 'FREQ=DAILY;INTERVAL=1');
    assert.equal(futureEvents[0].exdates.length, 0);
    assert.equal(
      futureEvents[0].startAt.valueOf(),
      newDate.set({ hour: 21 }).valueOf()
    );
  });

  it('Should get status 200 all', async function () {
    const dateRef = baseDateTime.plus({ day: 1 });
    const newDate = baseDateTime.plus({ day: 5 });
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
      formatIcalStringDates(dateRef.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${formatIcalStringDates(dateRef).startAt}
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
      createRepeatedEventBodyJSON(
        calendarID,
        eventDataCustom.id,
        eventDataCustom.remoteID,
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        undefined,
        'test',
        'FREQ=DAILY;INTERVAL=1'
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    const events = await getSyncedEvents(userID, eventDataCustom.remoteID);
    const baseEvent = events[0];

    assert.equal(events.length, 1);
    assert.notEqual(baseEvent.rRule, null);
    assert.equal(
      baseEvent.startAt.valueOf(),
      baseDateTime.set({ hour: 21 }).valueOf(),
      'baseEvent startAt'
    );
  });

  it('Should get status 200 all with changed calendar', async function () {
    const dateRef = baseDateTime.plus({ day: 1 });
    const newDate = baseDateTime.plus({ day: 5 });
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
      formatIcalStringDates(dateRef.set({ hour: 3 })).startAt
    }
DTEND;TZID=Europe/Berlin:${
      formatIcalStringDates(dateRef.set({ hour: 3 })).endAt
    }
RECURRENCE-ID;TZID=Europe/Berlin:${formatIcalStringDates(dateRef).startAt}
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

    const summary = `CHANGED_CALENDAR${v4()}`;
    const body = createBody(
      createRepeatedEventBodyJSON(
        calendarID2,
        eventDataCustom.id,
        v4(),
        eventDataCustom.url,
        eventDataCustom.etag,
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        newDate.set({ hour: 21 }).toString(),
        newDate.set({ hour: 22 }).toString(),
        undefined,
        summary,
        'FREQ=DAILY;INTERVAL=1',
        {
          externalID: eventDataCustom.remoteID,
          id: eventDataCustom.id,
          etag: eventDataCustom.etag,
          url: eventDataCustom.url,
        }
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH)
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    // trigger sync
    await getSyncedEvents(userID, eventDataCustom.remoteID);

    const events = await CalDavEventRepository.getRepository().find({
      where: {
        summary,
      },
    });

    const baseEvent = events[0];

    assert.equal(events.length, 1);
    assert.notEqual(baseEvent.rRule, null);
    assert.notEqual(baseEvent.externalID, eventDataCustom.remoteID);
    assert.equal(
      baseEvent.startAt.valueOf(),
      baseDateTime.set({ hour: 21 }).valueOf(),
      'baseEvent startAt'
    );
  });
});
