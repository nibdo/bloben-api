import { invalidUUID } from '../../../../../testHelpers/common';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { seedSharedCalendar } from '../../../../seeds/sharedCalendar';
import { seedUsers } from '../../../../seeds/user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/calendars/shared/${id}`;

describe(`Get shared calendar [GET] ${PATH}`, async function () {
  let sharedLinkID;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { sharedLink } = await seedSharedCalendar(userID);

    sharedLinkID = sharedLink.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .get(PATH(sharedLinkID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .get(PATH(sharedLinkID))
      .send();

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(invalidUUID))
      .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(sharedLinkID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
