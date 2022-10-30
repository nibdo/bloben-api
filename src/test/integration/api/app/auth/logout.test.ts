import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/user-seed';
import assert from 'assert';

import request from 'supertest';

const PATH = '/api/app/v1/auth/logout';

describe(`Logout [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });
});
