import { invalidUUID } from '../../../../testHelpers/common';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavCalendars } from '../../../seeds/3-calDavCalendars';
import { seedUsers } from '../../../seeds/1-user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (calendarID: string) =>
  `/api/app/v1/caldav-task/settings/${calendarID}`;

describe(`Update calDav task settings [PUT] ${PATH}`, async function () {
  let calDavCalendarID;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    calDavCalendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(calDavCalendarID))
      .send({
        orderBy: 'custom',
        order: [],
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send({
        order: [],
        orderBy: 'custom',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH(calDavCalendarID))
      .send({
        order: [],
        orderBy: 'custom',
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(calDavCalendarID))
      .send({
        order: [],
        orderBy: 'custom',
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
