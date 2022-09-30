import { invalidUUID } from '../../../../testHelpers/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { v4 } from 'uuid';

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUserWithEntity } from '../../../seeds/1-user-seed';

const PATH = '/api/admin/v1/users';

describe(`Create user admin [POST] ${PATH}`, async function () {
  let adminID;
  let user;
  beforeEach(async () => {
    const data = await seedUserWithEntity();
    user = data.user;
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send({
      username: v4(),
      password: 'root22',
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409 user exists', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send({
      username: user.username,
      password: 'afsazxczxcf',
    });

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).post(PATH).send({
      username: 'test_user123',
      password: 'afsazxczxcf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
