import { initSeeds } from '../../../seeds/init';

import request from 'supertest';
const assert = require('assert');

import {
  createAdminTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import {
  createAdminToken,
  createWrongAdminToken
} from '../../../../testHelpers/getTestUser';
import {testUserData} from "../../../seeds/1-user-seed";

const PATH = '/api/v1/admin/users';

describe(`Create user admin [POST] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    await initSeeds();
    token = await createAdminToken();
    wrongToken = await createWrongAdminToken()
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        username: 'vbde1',
        password: 'root22',
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409 user exists', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        username: testUserData.username,
        password: 'afsazxczxcf',
      });

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
        .post(PATH)
        .set('token', wrongToken)
        .send({
          username: 'test_user123',
          password: 'afsazxczxcf',
        });

    const { status } = response;

    assert.equal(status, 401);
  });
});
