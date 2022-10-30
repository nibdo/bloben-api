import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { createTestCalendarCalendar } from '../calDavServerTestHelper';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/user-caldav-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/caldav-calendars/${id}`;

describe(`[E2E] Update calDav calendar [PUT] ${PATH}`, async function () {
  let calendarID;
  let userID;
  beforeEach(async () => {
    const { userData } = await seedUsersE2E();
    userID = userData.user.id;
    const calDavCalendar = await createTestCalendarCalendar(
      userData.user.id,
      userData.calDavAccount
    );
    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send({
        color: 'indigo',
        name: 'test',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
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
