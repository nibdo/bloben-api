import { seedUsers } from '../../../seeds/user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { DateTime } from 'luxon';
import { ImportMock } from 'ts-mock-imports';
import {
  createDummyCalDavEvent,
  createDummyCalDavEventWithAlarm,
  createDummyCalDavEventWithAttendees,
  createDummyCalDavEventWithRepeatedAlarm,
} from '../../../seeds/calDavEvents';
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
import { seedCalDavCalendars } from '../../../seeds/calDavCalendars';

const PATH = '/api/app/v1/caldav-events';

describe(`Create calDav event [POST] ${PATH}`, async function () {
  let requestBody;
  let requestBodyAttendees;
  let requestBodyWithAlarm;
  let requestBodyWithAlarmRepeated;
  let userID;
  let demoUserID;

  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    requestBody = createDummyCalDavEvent(calDavCalendar.id);
    requestBodyAttendees = createDummyCalDavEventWithAttendees(
      calDavCalendar.id
    );
    requestBodyWithAlarm = createDummyCalDavEventWithAlarm(calDavCalendar.id);
    requestBodyWithAlarmRepeated = createDummyCalDavEventWithRepeatedAlarm(
      calDavCalendar.id,
      DateTime.now().set({ hour: 14, minute: 44, second: 0, millisecond: 0 })
    );
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...requestBody, calendarID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with attendees', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBodyAttendees);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 and create reminder', async function () {
    mockTsDavEvent(requestBodyWithAlarm.iCalString);

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBodyWithAlarm);

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
    mockTsDavEvent(requestBodyWithAlarmRepeated.iCalString);

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBodyWithAlarmRepeated);

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
