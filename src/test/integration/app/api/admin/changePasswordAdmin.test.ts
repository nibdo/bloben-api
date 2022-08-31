import { invalidUUID } from '../../../../testHelpers/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { DEFAULT_ADMIN_PASSWORD } from '../../../../../data/migrations/1630862365000-admin';
import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/admin/v1/user/change-password';

describe(`Change password admin [POST] ${PATH}`, async function () {
  let adminID;
  beforeEach(async () => {
    await seedUsers();
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: DEFAULT_ADMIN_PASSWORD,
      password: 'root22',
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 429 too many requests', async function () {
    const server: any = createTestServerWithSession(adminID);

    await request(server).post(PATH).set('X-Real-IP', '13213').send({
      oldPassword: 'root12',
      password: 'abcde',
    });

    const response: any = await request(server)
      .post(PATH)
      .set('X-Real-IP', '13213')
      .send({
        oldPassword: 'root',
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 429);
  });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: 'admin',
      password: 'afsazxczxcf',
    });

    const { status } = response;
    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong id', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).post(PATH).send({
      oldPassword: 'root',
      password: 'afsafvcvc',
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
