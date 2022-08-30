// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/admin/v1/users/${id}`;

describe(`Delete user admin [DELETE] ${PATH}`, async function () {
  let userID;
  let adminID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).delete(PATH(userID)).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404 not found', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server)
      .delete(PATH(invalidUUID))
      .send();

    const { status } = response;
    assert.equal(status, 404);
  });

  it('Should get status 409 cannot delete self', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).delete(PATH(adminID)).send();

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).delete(PATH(userID)).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
