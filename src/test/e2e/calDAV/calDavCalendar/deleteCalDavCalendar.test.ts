import { initSeeds } from '../../seeds/init';
import { createTestCalendarCalendar } from '../calDavServerTestHelper';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {invalidUUID} from "../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');

const PATH = (id: string) => `/api/v1/caldav-calendars/${id}`;

describe(`[E2E] Delete calDav calendar [DELETE] ${PATH}`, async function () {
  let calendarID;
  beforeEach(async () => {
    const { calDavAccount, user } = await initSeeds();
    const calDavCalendar = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );

    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .delete(PATH(invalidUUID))
      .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .delete(PATH(calendarID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
