import { invalidUUID } from '../../../../../testHelpers/common';

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../../seeds/init';

const PATH = (id: string) => `/api/v1/calendars/shared/${id}`;

const testBody = {
  name: 'Shared calendar',
  calDavCalendars: [],
  webcalCalendars: [],
  expireAt: null,
  password: null,
  settings: {},
};

describe(`Update shared calendar [PUT] ${PATH}`, async function () {
  let sharedLinkID;
  let calDavCalendarID;
  beforeEach(async () => {
    const { sharedLink, calDavCalendar } = await initSeeds();
    sharedLinkID = sharedLink.id;
    calDavCalendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(sharedLinkID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .put(PATH(sharedLinkID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(invalidUUID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(sharedLinkID))
      .send({ ...testBody, calDavCalendars: [calDavCalendarID] });

    const { status } = response;

    assert.equal(status, 200);
  });
});
