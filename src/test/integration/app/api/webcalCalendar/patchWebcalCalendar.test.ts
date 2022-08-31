import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedUsers } from '../../../seeds/1-user-seed';
import { seedWebcal } from '../../../seeds/6-webcal';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/webcal/calendars/${id}`;

describe(`Patch calendar [PATCH] ${PATH}`, async function () {
  let calendarID: string;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const webcalCalendar = await seedWebcal(userID);
    calendarID = webcalCalendar.id;
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
  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .patch(PATH(invalidUUID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 demo', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
