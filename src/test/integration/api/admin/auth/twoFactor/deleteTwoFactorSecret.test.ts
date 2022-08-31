import { seedUsers } from '../../../../seeds/1-user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../../testHelpers/common';
import { seedAdminUser } from '../../../../seeds/0-adminUser-seed';

const PATH = '/api/admin/v1/auth/two-factor';

describe(`Admin delete two factor [DELETE] ${PATH}`, async function () {
  let adminID;
  beforeEach(async () => {
    await seedUsers();
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
