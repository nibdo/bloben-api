import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { testUserData } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/users/change-password';

describe(`Change password [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
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
    const server: any = createTestServerWithSession();

    const response: any = await request(server).post(PATH).send({
      oldPassword: testUserData.password,
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(true);

    const response: any = await request(server).post(PATH).send({
      oldPassword: testUserData.password,
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 409 with wrong password', async function () {
    const server: any = createTestServerWithSession();

    const response: any = await request(server).post(PATH).send({
      oldPassword: 'sasfasfsaaasf',
      newPassword: 'sasfasfsaaasf',
      cryptoPassword: 'asdfasf',
    });
    const { status } = response;

    assert.equal(status, 409);
  });
});
