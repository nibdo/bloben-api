import {initSeeds} from "../../seeds/init";
import {
    createTestCalDavEvent,
    createTestCalendarCalendar
} from "../calDavServerTestHelper";
import {
    createE2ETestServerWithSession
} from "../../../testHelpers/initE2ETestServer";
import {invalidUUID} from "../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');

const PATH = '/api/v1/caldav-events';

describe(`[E2E] Delete calDav event [DELETE] ${PATH}`, async function () {
  let eventData;
  let calendarID;

  beforeEach(async () => {
    const { calDavAccount, user } = await initSeeds();
    const calDavCalendar = await createTestCalendarCalendar(
      user.id,
      calDavAccount
    );
    eventData = await createTestCalDavEvent(
      user.id,
      calDavAccount,
      calDavCalendar.id
    );
    calendarID = calDavCalendar.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession())
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
    const response: any = await request(createE2ETestServerWithSession())
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
    const response: any = await request(createE2ETestServerWithSession())
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
