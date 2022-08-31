// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { USER_ROLE } from '../../../../../api/user/UserEnums';
import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/admin/v1/users/${id}`;

describe(`Update user admin [PATCH] ${PATH}`, async function () {
  let userID;
  let adminID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).patch(PATH(userID)).send({
      isEnabled: true,
      emailsAllowed: false,
      role: USER_ROLE.DEMO,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404 not found', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).patch(PATH(invalidUUID)).send({
      isEnabled: true,
      emailsAllowed: false,
      role: USER_ROLE.DEMO,
    });

    const { status } = response;
    assert.equal(status, 404);
  });

  it('Should get status 409 cannot update self', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).patch(PATH(adminID)).send({
      isEnabled: true,
      emailsAllowed: false,
      role: USER_ROLE.DEMO,
    });

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).patch(PATH(userID)).send({
      isEnabled: true,
      emailsAllowed: false,
      role: USER_ROLE.DEMO,
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
