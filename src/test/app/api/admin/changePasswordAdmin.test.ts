import { initSeeds } from '../../../seeds/init';

import request from 'supertest';
const assert = require('assert');

import { createAdminTestServerWithSession } from '../../../utils/initTestServer';
import {
  createAdminToken,
  createWrongAdminToken,
} from '../../../utils/getTestUser';
import { DEFAULT_ADMIN_PASSWORD } from '../../../../data/migrations/1630862365000-admin';

const PATH = '/api/v1/admin/change-password';

describe(`Change password admin [POST] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    await initSeeds();
    token = await createAdminToken();
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        oldPassword: DEFAULT_ADMIN_PASSWORD,
        password: 'root22',
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 429 too many requests', async function () {
    const server: any = createAdminTestServerWithSession();

    await request(server)
      .post(PATH)
      .set('token', token)
      .set('X-Real-IP', '13213')
      .send({
        oldPassword: 'root12',
        password: 'abcde',
      });

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .set('X-Real-IP', '13213')
      .send({
        oldPassword: 'root',
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 429);
  });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        oldPassword: 'admin',
        password: 'afsazxczxcf',
      });

    const { status } = response;
    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', wrongToken)
      .send({
        oldPassword: 'root',
        password: 'afsafvcvc',
      });

    const { status } = response;

    assert.equal(status, 401);
  });
});
