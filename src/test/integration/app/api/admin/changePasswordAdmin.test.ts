// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { DEFAULT_ADMIN_PASSWORD } from '../../../../../data/migrations/1630862365000-admin';
import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/admin/user/change-password';

describe(`Change password admin [POST] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    await seedUsers();
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
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
