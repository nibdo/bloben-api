import { invalidUUID } from '../../../../../testHelpers/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { seedAdminUser } from '../../../../seeds/adminUser-seed';

const PATH = '/api/admin/v1/auth/two-factor';

describe(`Admin generate two factor [POST] ${PATH}`, async function () {
  let adminID;
  let idWith2FA;

  beforeEach(async () => {
    const { id } = await seedAdminUser();
    adminID = id;

    const data = await seedAdminUser({ isTwoFactorEnabled: true });
    idWith2FA = data.id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409 two factor is enabled', async function () {
    const server: any = createTestServerWithSession(idWith2FA);

    const response: any = await request(server).post(PATH).send();

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).post(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
