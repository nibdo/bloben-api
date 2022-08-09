import { initSeeds, initUserSeed } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import {invalidUUID} from "../../../../testHelpers/common";
import {
  createTestCalendarCalendar
} from "../../../../e2e/calDAV/calDavServerTestHelper";
import {
  createDummyCalDavEvent, createDummyCalDavEventWithAlarm,
  createDummyCalDavEventWithAttendees, createDummyCalDavEventWithRepeatedAlarm
} from "../../../seeds/4-calDavEvents";
import {DateTime} from "luxon";

const PATH = '/api/v1/calendar-settings';

describe(`Patch calendar settings [PATCH] ${PATH}`, async function () {
  let calendarID
  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    calendarID = calDavCalendar.id
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession();

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
      hourHeight: 60,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404', async function () {
    const server: any = createTestServerWithSession();

    const response: any = await request(server).patch(PATH).send({
      defaultCalendarID: invalidUUID,
    });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(true);

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
    });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200 calendar', async function () {
    const server: any = createTestServerWithSession();

    const response: any = await request(server).patch(PATH).send({
      defaultCalendarID: calendarID,
    });

    const { status } = response;

    assert.equal(status, 200);
  });
});
