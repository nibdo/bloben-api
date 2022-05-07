import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import { createTestServer } from '../../../../testHelpers/initTestServer';
import {testDemoUserData, testUserData} from '../../../seeds/1-user-seed';

const PATH = '/api/v1/users/login-demo';

describe(`Login demo user [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should redirect to app', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).query({
      username: testDemoUserData.username,
      password: testDemoUserData.password,
      redirect: 'http://localhost:8080'
    });

    const { status, text, headers } = response;

    assert.equal(status, 302);
    assert.equal(text, 'Found. Redirecting to http://localhost:8080');
    assert.equal(headers['set-cookie'].length, 1);

  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).query({
      username: testDemoUserData.username,
      password: 'wrongPass',
      redirect: 'http://localhost:8080'
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
