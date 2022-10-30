import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {
  createTestCalDavEvent,
  createTestCalendarCalendar,
} from '../calDavServerTestHelper';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/user-caldav-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/caldav-events';

describe(`[E2E] Delete calDav event [DELETE] ${PATH}`, async function () {
  let eventData;
  let calendarID;
  let userID;
  beforeEach(async () => {
    const { userData } = await seedUsersE2E();
    userID = userData.user.id;
    const calDavCalendar = await createTestCalendarCalendar(
      userData.user.id,
      userData.calDavAccount
    );
    eventData = await createTestCalDavEvent(
      userData.user.id,
      userData.calDavAccount,
      calDavCalendar.id
    );
    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID: invalidUUID,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID,
        id: invalidUUID,
        etag: eventData.etag,
        url: eventData.url,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID,
        id: eventData.id,
        etag: eventData.etag,
        url: eventData.url,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
