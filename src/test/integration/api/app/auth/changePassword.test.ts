// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  TEST_USER_PASSWORD,
  seedUsers,
  testUserData,
} from '../../../seeds/1-user-seed';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';

const PATH = '/api/app/v1/auth/change-password';

describe(`Change password [POST] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      oldPassword: testUserData.password,
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: TEST_USER_PASSWORD,
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: TEST_USER_PASSWORD,
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 409 with wrong password', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: 'sasfasfsaaasf',
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });
    const { status } = response;

    assert.equal(status, 409);
  });
});
