// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/app/v1/users/2fa';

describe(`Delete two factor [DELETE] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).delete(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).delete(PATH);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).delete(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });
});
