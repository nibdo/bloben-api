// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/users/2fa/generate';

describe(`Generate two factor [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });
});
