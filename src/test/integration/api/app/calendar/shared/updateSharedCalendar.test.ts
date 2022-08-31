import { invalidUUID } from '../../../../../testHelpers/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { seedCalDavCalendars } from '../../../../seeds/3-calDavCalendars';
import { seedSharedCalendar } from '../../../../seeds/10-sharedCalendar';
import { seedUsers } from '../../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/app/v1/calendars/shared/${id}`;

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
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    const { sharedLink } = await seedSharedCalendar(userID);

    calDavCalendarID = calDavCalendar.id;
    sharedLinkID = sharedLink.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(sharedLinkID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH(sharedLinkID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send(testBody);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(sharedLinkID))
      .send({ ...testBody, calDavCalendars: [calDavCalendarID] });

    const { status } = response;

    assert.equal(status, 200);
  });
});
