// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedCalDavCalendars } from '../../../seeds/calDavCalendars';
import { seedUsers } from '../../../seeds/user-seed';

const PATH = '/api/app/v1/calendar-settings';

describe(`Patch calendar settings [PATCH] ${PATH}`, async function () {
  let calendarID;
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    calendarID = calDavCalendar.id;
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
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
      hourHeight: 60,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).patch(PATH).send({
      defaultCalendarID: invalidUUID,
    });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
    });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200 calendar', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).patch(PATH).send({
      defaultCalendarID: calendarID,
    });

    const { status } = response;

    assert.equal(status, 200);
  });
});
