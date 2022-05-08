import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import { createTestServer } from '../../../../testHelpers/initTestServer';
import {testDemoUserData, testUserData} from '../../../seeds/1-user-seed';

const PATH = '/api/v1/users/login';

describe(`Login user [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 200', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: testUserData.username,
      password: testUserData.password,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 200 demo user', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: testDemoUserData.username,
      password: testDemoUserData.password,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 429 too many requests', async function () {
    const server: any = createTestServer();

    await request(server).post(PATH).set('X-Real-IP', '13213').send({
      username: testUserData.username,
      password: 'abcde',
    });

    const response: any = await request(server)
      .post(PATH)
      .set('X-Real-IP', '13213')
      .send({
        username: testUserData.username,
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 429);
  });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: testUserData.username,
      password: 'afsaf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong user', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: 'asfafafa',
      password: 'afsaf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
