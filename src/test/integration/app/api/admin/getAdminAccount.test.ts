import { invalidUUID } from '../../../../testHelpers/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/admin/v1/user';

describe(`Get admin account [GET] ${PATH}`, async function () {
  let adminID;
  beforeEach(async () => {
    await seedUsers();
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong id', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
