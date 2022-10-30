import { invalidUUID } from '../../../../testHelpers/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavCalendars } from '../../../seeds/calDavCalendars';
import { seedUsers } from '../../../seeds/user-seed';

const PATH = (id: string) => `/api/app/v1/caldav-calendars/${id}`;

describe(`Update calDav calendar [PUT] ${PATH}`, async function () {
  let calendarID;
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    calendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(calendarID))
      .send({
        color: 'indigo',
        name: 'test',
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH(calendarID))
      .send({
        color: 'indigo',
        name: 'test',
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send({
        color: 'indigo',
        name: 'test',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(calendarID))
      .send({
        color: 'indigo',
        name: 'test',
        alarms: [
          {
            amount: 10,
            timeUnit: 'minutes',
          },
        ],
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
