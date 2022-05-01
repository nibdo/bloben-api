import {
  createDummyCalDavEvent,
  createDummyCalDavEventWithAlarm,
  createDummyCalDavEventWithAttendees,
  createDummyCalDavEventWithRepeatedAlarm,
} from '../../../integration/seeds/4-calDavEvents';

const request = require('supertest');
const assert = require('assert');
import { DateTime } from 'luxon';
import { initSeeds } from '../../seeds/init';
import {
  createTestCalDavEvent,
  createTestCalendarCalendar,
} from '../calDavServerTestHelper';
import { getTestReminders } from '../../../testHelpers/getTestReminders';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {invalidUUID} from "../../../testHelpers/common";

const PATH = '/api/v1/caldav-events';

describe(`[E2E] Update calDav event [PUT] ${PATH}`, async function () {
  let eventData;
  let calendarID;
  let calendarID2;

  beforeEach(async () => {
    const { calDavAccount, user } = await initSeeds();
    const calDavCalendar = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );
    const calDavCalendar2 = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );
    eventData = await createTestCalDavEvent(
      user.id,
      calDavAccount,
      calDavCalendar.id
    );
    calendarID = calDavCalendar.id;
    calendarID2 = calDavCalendar2.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        calendarID: invalidUUID,
        externalID: eventData.remoteID,
        iCalString: createDummyCalDavEvent(calendarID, eventData.remoteID)
          .iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        calendarID,
        externalID: eventData.remoteID,
        iCalString: createDummyCalDavEvent(calendarID, eventData.remoteID)
          .iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with changed calendar', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        calendarID: calendarID2,
        externalID: eventData.remoteID,
        iCalString: createDummyCalDavEvent(calendarID2, eventData.remoteID)
          .iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: {
          externalID: eventData.remoteID,
          id: eventData.id,
          etag: eventData.etag,
          url: eventData.url,
        },
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with attendees', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        externalID: eventData.remoteID,
        calendarID,
        iCalString: createDummyCalDavEventWithAttendees(
          calendarID,
          eventData.remoteID
        ).iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 and create reminder', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        externalID: eventData.remoteID,
        calendarID,
        iCalString: createDummyCalDavEventWithAlarm(
          calendarID,
          eventData.remoteID
        ).iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: null,
      });

    const { status } = response;

    const reminders = await getTestReminders(eventData.remoteID);

    assert.equal(status, 200);
    assert.equal(reminders.length, 1);
    assert.equal(
      reminders?.[0].sendAt.toISOString(),
      '2021-04-01T10:50:00.000Z'
    );
  });

  it('Should get status 200 and create repeated reminders', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH)
      .send({
        externalID: eventData.remoteID,
        calendarID,
        iCalString: createDummyCalDavEventWithRepeatedAlarm(
          calendarID,
          DateTime.now().set({
            hour: 14,
            minute: 44,
            second: 0,
            millisecond: 0,
          }),
          eventData.remoteID
        ).iCalString,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
        prevEvent: null,
      });

    const { status } = response;

    const reminders = await getTestReminders(eventData.remoteID);

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
