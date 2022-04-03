const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import { initSeeds } from '../../../seeds/init';
import { invalidUUID } from '../adminUsers/adminUpdateUser.test';

const PATH = (id: string) => `/api/v1/caldav-calendars/${id}`;

describe(`Patch calDav calendar [PATCH] ${PATH}`, async function () {
  let calendarID;
  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    calendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
      .patch(PATH(invalidUUID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
