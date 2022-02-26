import {initSeeds} from "../../../seeds/init";

import request from 'supertest';
const assert = require('assert');

import {
  createAdminTestServerWithSession,
} from '../../../utils/initTestServer';
import {testUserData} from "../../../seeds/1-user-seed";
import {
  DEFAULT_ADMIN_PASSWORD
} from "../../../../data/migrations/1630862365000-admin";

const PATH = '/api/v1/admin/login';

describe(`Login admin [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds()
  })

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server).post(PATH).send({
      username: 'admin',
      password: DEFAULT_ADMIN_PASSWORD,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 429 too many requests', async function () {
    const server: any = createAdminTestServerWithSession();

    await request(server).post(PATH).set('X-Real-IP', '13213').send({
      username: 'admin',
      password: 'abcde',
    });

    const response: any = await request(server)
      .post(PATH)
      .set('X-Real-IP', '13213')
      .send({
        username: 'admin',
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 429);
  });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server).post(PATH).send({
      username: 'admin',
      password: 'afsazxczxcf',
    })

    const { status } = response;
    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong user', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server).post(PATH).send({
      username: testUserData.username,
      password: testUserData.password,
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
