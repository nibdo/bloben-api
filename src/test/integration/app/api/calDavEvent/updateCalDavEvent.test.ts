import {
  createDummyCalDavEventWithAlarm,
  createDummyCalDavEventWithAttendees,
  createDummyCalDavEventWithRepeatedAlarm,
  seedCalDavEvents,
  testIcalString,
} from '../../../seeds/4-calDavEvents';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { DateTime } from 'luxon';
import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { getTestReminders } from '../../../../testHelpers/getTestReminders';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { invalidUUID } from '../../../../testHelpers/common';
import {
  mockTsDav,
  mockTsDavEvent,
  mockTsDavUnauthorized,
} from '../../../../__mocks__/tsdav';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/app/v1/caldav-events';

describe(`Update calDav event [PUT] ${PATH}`, async function () {
  let calDavEvent;
  let userID;
  let demoUserID;
  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { event } = await seedCalDavEvents(userID);
    calDavEvent = event;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).put(PATH).send({
      calendarID: calDavEvent.calendar.id,
      externalID: calDavEvent.externalID,
      iCalString: testIcalString,
      id: calDavEvent.id,
      etag: 'CTGARAF',
      url: calDavEvent.href,
      prevEvent: null,
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        calendarID: invalidUUID,
        externalID: calDavEvent.externalID,
        iCalString: testIcalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: testIcalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: testIcalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: testIcalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with changed calendar', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: testIcalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: {
          externalID: calDavEvent.externalID,
          id: calDavEvent.id,
          url: calDavEvent.href,
          etag: 'CTGARAF',
        },
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with attendees', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: createDummyCalDavEventWithAttendees(calDavEvent.calendar.id)
          .iCalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 and create reminder', async function () {
    const requestBodyWithAlarm = createDummyCalDavEventWithAlarm(
      calDavEvent.calendar.id
    );

    mockTsDavEvent(requestBodyWithAlarm.iCalString);

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: requestBodyWithAlarm.iCalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    const reminders = await getTestReminders(requestBodyWithAlarm.externalID);

    assert.equal(status, 200);
    assert.equal(reminders.length, 1);
    assert.equal(
      reminders?.[0].sendAt.toISOString(),
      '2021-04-01T10:50:00.000Z'
    );
  });

  it('Should get status 200 and create repeated reminders', async function () {
    const requestBodyWithAlarmRepeated =
      createDummyCalDavEventWithRepeatedAlarm(
        calDavEvent.calendar.id,
        DateTime.now().set({ hour: 14, minute: 44, second: 0, millisecond: 0 })
      );

    mockTsDavEvent(requestBodyWithAlarmRepeated.iCalString);

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavEvent.externalID,
        calendarID: calDavEvent.calendar.id,
        iCalString: requestBodyWithAlarmRepeated.iCalString,
        id: calDavEvent.id,
        etag: 'CTGARAF',
        url: calDavEvent.href,
        prevEvent: null,
      });

    const { status } = response;

    const reminders = await getTestReminders(
      requestBodyWithAlarmRepeated.externalID
    );

    const refDate = DateTime.now().set({
      hour: 14,
      minute: 34,
      second: 0,
      millisecond: 0,
    });

    assert.equal(status, 200);
    assert.equal(
      reminders?.[0].sendAt.toISOString(),
      refDate.toUTC().toString()
    );
    assert.equal(
      reminders?.[1].sendAt.toISOString(),
      refDate.plus({ day: 1 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[2].sendAt.toISOString(),
      refDate.plus({ day: 2 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[3].sendAt.toISOString(),
      refDate.plus({ day: 3 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[4].sendAt.toISOString(),
      refDate.plus({ day: 4 }).toUTC().toString()
    );
  });
});
