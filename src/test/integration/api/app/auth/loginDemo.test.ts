// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  TEST_USER_PASSWORD,
  seedUserWithEntity,
} from '../../../seeds/user-seed';
import { createTestServer } from '../../../../testHelpers/initTestServer';

const PATH = '/api/app/v1/auth/login-demo';

describe(`Login demo user [GET] ${PATH}`, async function () {
  let demoUser;
  beforeEach(async () => {
    const data = await seedUserWithEntity();
    demoUser = data.demoUser;
  });

  it('Should redirect to app', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).query({
      username: demoUser.username,
      password: TEST_USER_PASSWORD,
      redirect: 'http://localhost:8080',
    });

    const { status, text, headers } = response;

    assert.equal(status, 302);
    assert.equal(text, 'Found. Redirecting to http://localhost:8080');
    assert.equal(headers['set-cookie'].length, 1);
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).query({
      username: demoUser.username,
      password: 'wrongPass',
      redirect: 'http://localhost:8080',
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
