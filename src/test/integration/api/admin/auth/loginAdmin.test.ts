// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServer } from '../../../../testHelpers/initTestServer';
import { seedAdminUser } from '../../../seeds/adminUser-seed';
import { seedUsers, testUserData } from '../../../seeds/user-seed';

const PATH = '/api/admin/v1/auth/login';

describe(`Login admin [POST] ${PATH}`, async function () {
  let username;
  let usernameWith2FA;
  beforeEach(async () => {
    await seedUsers();
    const data = await seedAdminUser();
    username = data.username;
    const data2 = await seedAdminUser({ isTwoFactorEnabled: true });
    usernameWith2FA = data2.username;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: username,
      password: process.env.INITIAL_ADMIN_PASSWORD,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 200 with two factor', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: usernameWith2FA,
      password: process.env.INITIAL_ADMIN_PASSWORD,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, false);
    assert.equal(body.isTwoFactorEnabled, true);
  });

  // it('Should get status 429 too many requests', async function () {
  //   const server: any = createTestServer();
  //
  //   await request(server).post(PATH).set('X-Real-IP', '13213').send({
  //     username: username,
  //     password: 'abcde',
  //   });
  //
  //   const response: any = await request(server)
  //     .post(PATH)
  //     .set('X-Real-IP', '13213')
  //     .send({
  //       username: username,
  //       password: 'abcde',
  //     });
  //
  //   const { status } = response;
  //
  //   assert.equal(status, 429);
  // });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: username,
      password: 'afsazxczxcf',
    });

    const { status } = response;
    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong user', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: 'abgkew',
      password: testUserData.password,
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
