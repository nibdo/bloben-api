import { invalidUUID } from '../../../../../testHelpers/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { seedUser } from '../../../../seeds/1-user-seed';

const PATH = '/api/app/v1/auth/two-factor';

describe(`Generate two factor [POST] ${PATH}`, async function () {
  let userID;
  let idWith2FA;

  beforeEach(async () => {
    const { id } = await seedUser();
    userID = id;

    const data = await seedUser({ isTwoFactorEnabled: true });
    idWith2FA = data.id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(userID);

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
