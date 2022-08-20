import { invalidUUID } from '../../../../testHelpers/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavCalendars } from '../../../seeds/3-calDavCalendars';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/v1/caldav-accounts/${id}`;

describe(`Delete calDav account [DELETE] ${PATH}`, async function () {
  let calDavAccountID;
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavAccount } = await seedCalDavCalendars(userID);
    calDavAccountID = calDavAccount.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .delete(PATH(calDavAccountID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH(invalidUUID))
      .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 Forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .delete(PATH(calDavAccountID))
      .send();

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH(calDavAccountID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
