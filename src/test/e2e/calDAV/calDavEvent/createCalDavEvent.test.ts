import { initSeeds } from '../../seeds/init';

const request = require('supertest');
const assert = require('assert');
import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import {
  createDummyCalDavEvent,
  createDummyCalDavEventWithAlarm,
  createDummyCalDavEventWithAttendees,
  createDummyCalDavEventWithRepeatedAlarm,
} from '../../../integration/seeds/4-calDavEvents';
import { getTestReminders } from '../../../testHelpers/getTestReminders';
import { createTestCalendarCalendar } from '../calDavServerTestHelper';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { invalidUUID } from '../../../testHelpers/common';

const PATH = '/api/v1/caldav-events';

describe(`[E2E] Create calDav event [POST] ${PATH}`, async function () {
  let requestBody;
  let requestBodyAttendees;
  let requestBodyWithAlarm;
  let requestBodyWithAlarmRepeated;
  let remoteID;

  beforeEach(async () => {
    remoteID = v4();
    const { calDavAccount, user } = await initSeeds();
    const calDavCalendar = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );
    requestBody = createDummyCalDavEvent(calDavCalendar.id, remoteID);
    requestBodyAttendees = createDummyCalDavEventWithAttendees(
      calDavCalendar.id,
      remoteID
    );
    requestBodyWithAlarm = createDummyCalDavEventWithAlarm(
      calDavCalendar.id,
      remoteID
    );
    requestBodyWithAlarmRepeated = createDummyCalDavEventWithRepeatedAlarm(
      calDavCalendar.id,
      DateTime.now().set({ hour: 14, minute: 44, second: 0, millisecond: 0 }),
      remoteID
    );
  });

  it('Should get status 404 not found', async function () {
    await request(createE2ETestServerWithSession())
      .post(PATH)
      .send(requestBody);

    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({ ...requestBody, calendarID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with attendees', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send(requestBodyAttendees);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 and create reminder', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send(requestBodyWithAlarm);

    const { status } = response;

    const reminders = await getTestReminders(remoteID);

    assert.equal(status, 200);
    assert.equal(reminders.length, 1);
    assert.equal(
      reminders?.[0].sendAt.toISOString(),
      '2021-04-01T10:50:00.000Z'
    );
  });

  it('Should get status 200 and create repeated reminders', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send(requestBodyWithAlarmRepeated);

    const { status } = response;

    const reminders = await getTestReminders(remoteID);

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
