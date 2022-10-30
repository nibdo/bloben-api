import { seedUsers } from '../../../seeds/user-seed';

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
import { seedTasks } from '../../../seeds/calDavTasks';

const PATH = (calendarID: string) =>
  `/api/app/v1/caldav-tasks?calendarID=${calendarID}&page=1&limit=20`;

describe(`Get calDav tasks [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  let calendarID;
  let demoUserCalendarID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    const { calDavCalendar: demoUserCalendar } = await seedCalDavCalendars(
      demoUserID
    );

    await seedTasks(userID);

    calendarID = calDavCalendar.id;
    demoUserCalendarID = demoUserCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .get(PATH(calendarID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(invalidUUID))
      .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .get(PATH(demoUserCalendarID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(calendarID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
