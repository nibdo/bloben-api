import { authenticator } from 'otplib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../../testHelpers/common';
import { seedAdminUser } from '../../../../seeds/0-adminUser-seed';

const PATH = '/api/admin/v1/user/2fa/enable';

describe(`Admin enable two factor [POST] ${PATH}`, async function () {
  let idWith2FA;
  let secret;
  let adminID;

  beforeEach(async () => {
    const { id } = await seedAdminUser();
    adminID = id;

    secret = authenticator.generateSecret();
    const data = await seedAdminUser({
      twoFactorSecret: secret,
    });
    idWith2FA = data.id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(idWith2FA);
    const correctCode = authenticator.generate(secret);

    const response: any = await request(server).post(PATH).send({
      otpCode: correctCode,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409', async function () {
    const server: any = createTestServerWithSession(idWith2FA);

    const response: any = await request(server).post(PATH).send({
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 two factor missing', async function () {
    const server: any = createTestServerWithSession(adminID);

    const response: any = await request(server).post(PATH).send({
      otpCode: '123456',
    });

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
