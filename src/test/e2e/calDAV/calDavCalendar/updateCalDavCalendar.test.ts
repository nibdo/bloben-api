import { initSeeds } from '../../seeds/init';
import { createTestCalendarCalendar } from '../calDavServerTestHelper';
import {
    createE2ETestServerWithSession
} from "../../../testHelpers/initE2ETestServer";
import {invalidUUID} from "../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');

const PATH = (id: string) => `/api/v1/caldav-calendars/${id}`;

describe(`[E2E] Update calDav calendar [PUT] ${PATH}`, async function () {
  let calendarID;
  beforeEach(async () => {
    const { user, calDavAccount } = await initSeeds();
    const calDavCalendar = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );
    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH(invalidUUID))
      .send({
        color: 'indigo',
        name: 'test',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
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
